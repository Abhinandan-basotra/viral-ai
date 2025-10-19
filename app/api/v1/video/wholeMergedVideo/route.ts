import { NextRequest, NextResponse } from "next/server";
import { downloadFile } from "@/app/lib/downloadFiles";
import { cloudinary } from "@/app/lib/cloudinary";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import prisma from "@/app/lib/db";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

async function mergeVideos(
  temp1: string,
  temp2: string,
  output: string,
  startTime: number,
  endTime: number
) {
  const duration1 = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(temp1, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration as number);
    });
  });

  const fadeDur = 0.5;
  const overlapStart = Math.max(0, duration1 - fadeDur);

  const filter = `
    [0:v]scale=720:1280,format=yuv420p,setsar=1,
         fade=t=out:st=${overlapStart}:d=${fadeDur}[v0];
    [1:v]scale=720:1280,format=yuv420p,setsar=1,
         fade=t=in:st=0:d=${fadeDur}[v1];
    [0:a]afade=t=out:st=${overlapStart}:d=${fadeDur}[a0];
    [1:a]afade=t=in:st=0:d=${fadeDur}[a1];
    [v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]
  `.replace(/\s+/g, "");

  return new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(temp1)
      .input(temp2)
      .complexFilter(filter)
      .outputOptions([
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
      ])
      .on("error", e => reject(e))
      .on("end", () => resolve())
      .save(path.resolve(output));
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
      const { url, startTime = 0, endTime = 5 } = outputs[i]; 
      const scene = `scene_${i + 1}.mp4`;
      await downloadFile(url, scene);

      if (i === 0) {
        fs.copyFileSync(scene, currentOutput);
      } else {
        const tempOutput = `temp_${i}_${projectId}.mp4`;
        await mergeVideos(currentOutput, scene, tempOutput, startTime, endTime);
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

    fs.unlinkSync(finalOutput);

    await prisma.project.update({
        where: {
            id: projectId
        },
        data: {
            finalUrl: uploaded.secure_url
        }
    })
    return NextResponse.json({ success: true, url: uploaded.secure_url });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
