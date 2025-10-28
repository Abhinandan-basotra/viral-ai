import { downloadFile } from "@/app/lib/downloadFiles";
import { cloudinary } from "@/app/lib/cloudinary/cloudinary";
import ffmpeg from "fluent-ffmpeg";
import { NextRequest, NextResponse } from "next/server";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

async function hasAudio(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return resolve(false);
      const hasAudioStream = metadata.streams.some(
        (s) => s.codec_type === "audio"
      );
      resolve(hasAudioStream);
    });
  });
}

async function mergeVideos(temp1: string, temp2: string, output: string) {
  const duration1 = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(temp1, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration as number);
    });
  });

  const fadeDur = 0.7;
  const hasAudio1 = await hasAudio(temp1);
  const hasAudio2 = await hasAudio(temp2);

  // Base filter (video only)
  let filter = `[0:v][1:v]xfade=transition=fade:duration=${fadeDur}:offset=${duration1 - fadeDur}[v]`;

  // If both have audio, add audio crossfade
  if (hasAudio1 && hasAudio2) {
    filter += `;[0:a][1:a]acrossfade=d=${fadeDur}[a]`;
  }

  return new Promise<void>((resolve, reject) => {
    const command = ffmpeg()
      .input(temp1)
      .input(temp2)
      .complexFilter(filter)
      .outputOptions([
        "-map", "[v]",
        ...(hasAudio1 && hasAudio2 ? ["-map", "[a]"] : []),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-ac", "2",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
      ])
      .on("start", (cmd) => console.log("🎬 FFmpeg command:", cmd))
      .on("error", (e) => {
        console.error("❌ FFmpeg error:", e.message);
        reject(e);
      })
      .on("end", () => {
        console.log("✅ Merge complete");
        resolve();
      })
      .save(path.resolve(output));
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { video1, video2 } = data;

    const temp1Path = "temp_1.mp4";
    const temp2Path = "temp_2.mp4";
    const outputPath = "output_1.mp4";

    await downloadFile(video1, temp1Path);
    await downloadFile(video2, temp2Path);

    await mergeVideos(temp1Path, temp2Path, outputPath);

    const uploadRes = await cloudinary.uploader.upload(outputPath, {
      resource_type: "video",
      folder: "merged_videos",
    });

    // Cleanup
    [temp1Path, temp2Path, outputPath].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));

    return NextResponse.json({ message: "done", url: uploadRes.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
