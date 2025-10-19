import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { downloadFile } from "@/app/lib/downloadFiles";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

function getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration as number);
        });
    });
}
export async function getVideoFPS(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);

            // Find the video stream
            const videoStream = metadata.streams?.find((s) => s.codec_type === "video");
            if (!videoStream) return reject(new Error("No video stream found"));

            // avg_frame_rate is usually like "30000/1001" or "25/1"
            const avgRate = videoStream.avg_frame_rate;
            if (!avgRate || avgRate === "0/0") return reject(new Error("FPS not available"));

            const [num, den] = avgRate.split("/").map(Number);
            const fps = num / den;

            resolve(fps);
        });
    });
}

// async function mergeWithZoomOut(temp1: string, temp2: string, output: string) {
//   const duration1 = await getVideoDuration(temp1);
//   const fadeDur = 1;
//   const fadeStart = duration1 - fadeDur;

//   const filter = `
//     [0:v]scale=720:1280,format=yuv420p,setsar=1,
//           fade=t=out:st=${fadeStart}:d=${fadeDur}[v0];
//     [1:v]scale=720:1280,format=yuv420p,setsar=1,
//           fade=t=in:st=0:d=${fadeDur}[v1];
//     [v0][v1]concat=n=2:v=1:a=0,format=yuv420p[outv]
//   `.replace(/\s+/g, "");

//   return new Promise<void>((resolve, reject) => {
//     ffmpeg()
//       .input(temp1)
//       .input(temp2)
//       .complexFilter(filter)
//       .outputOptions([
//         "-map", "[outv]",
//         "-map", "0:a?",
//         "-c:v", "libx264",
//         "-pix_fmt", "yuv420p",
//       ])
//       .on("start", c => console.log("Running:", c))
//       .on("error", e => reject(e))
//       .on("end", () => resolve())
//       .save(path.resolve(output));
//   });
// }

async function mergeWithZoomOut(inputVideo: string, outputVideo: string) {
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(inputVideo)
      .videoFilters(
        "scale=iw*4:ih*4,zoompan=z='if(lte(mod(on,60),30),zoom+0.002,zoom-0.002)':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2'"
      )
      .outputOptions([
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "23",
        "-y" // overwrite if exists
      ])
      .on("start", c => console.log("Running:", c))
      .on("error", err => reject(err))
      .on("end", () => {
        console.log("✅ Zoom effect applied successfully!");
        resolve();
      })
      .save(path.resolve(outputVideo));
  });
}






export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const video1 = data.first;
        const video2 = data.second;

        const temp1 = 'temp1.mp4';
        const temp2 = 'temp2.mp4';
        await downloadFile(video1, temp1);
        await downloadFile(video2, temp2);

        const output = 'output.mp4'
        await mergeWithZoomOut(temp1,output);
        return NextResponse.json({ message: "done" })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error" });
    }
}