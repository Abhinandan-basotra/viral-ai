import { NextRequest, NextResponse } from "next/server";
import { downloadFile } from "@/app/lib/downloadFiles";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { cloudinary } from "@/app/lib/cloudinary";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

async function mergeVideos(input1: string, input2: string, output: string, animate: boolean) {
    return new Promise<void>((resolve, reject) => {
        const command = ffmpeg().input(input1).input(input2);

        let filterString;
        if (animate) {
            filterString = `
  [0:v]fps=30,scale=1080:1920,zoom=zoom='1.0-0.0005*t':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[zoomout];
  [1:v]fps=30,scale=1080:1920,zoom=zoom='1.0+0.0005*t':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[zoomin];
  [zoomout][zoomin]xfade=transition=fade:duration=1:offset=2[outv]
`.replace(/\s+/g, " ");


        } else {
            filterString = `
    [0:v][1:v]concat=n=2:v=1:a=0[outv]
  `.replace(/\s+/g, " ");
        }


        command
            .complexFilter(filterString)
            .outputOptions(["-map [outv]", "-map 0:a?", "-shortest"])
            .save(output)
            .on("start", (cmd) => console.log("🎬 Running:", cmd))
            .on("end", () => {
                console.log("✅ Merge complete:", output);
                resolve();
            })
            .on("error", (err) => {
                console.error("❌ FFmpeg error:", err.message);
                reject(err);
            });
    });
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const outputs = data.outputs;
        const projectId = data.projectId;

        const finalOutput = `final_output_${projectId}.mp4`;
        let currentOutput = `temp_0_${projectId}.mp4`;

        for (let i = 0; i < outputs.length; i++) {
            const scene = `scene_${i + 1}.mp4`;
            await downloadFile(outputs[i].url, scene);

            if (i === 0) {
                fs.copyFileSync(scene, currentOutput);
            } else {
                const tempOutput = `temp_${i}_${projectId}.mp4`;
                const animate = true;

                await mergeVideos(currentOutput, scene, tempOutput, animate);
                fs.unlinkSync(currentOutput);
                currentOutput = tempOutput;
            }

            fs.unlinkSync(scene);
        }

        fs.renameSync(currentOutput, finalOutput);

        const uploaded = await cloudinary.uploader.upload(finalOutput, {
            resource_type: "video",
            folder: "generated_scenes",
            use_filename: true,
        });

        return NextResponse.json({ success: true, url: uploaded.secure_url });
    } catch (error) {
        console.error("❌ Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
