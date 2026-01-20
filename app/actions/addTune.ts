'use server';

import { downloadFile } from "@/app/lib/downloadFiles";
import prisma from "@/app/lib/db";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import fs from "fs";
import { uploadVideoToCloudinary } from "@/app/lib/cloudinary/uploadVideoToCloudinary";
import path from "path";

const paths = {
  projectPath: "",
  tunePath: "",
  projectAudioPath: "",
  finalAudioPath: "",
  finalVideoPath: "",
};

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}
if (ffprobeStatic) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
}

export async function safeUnlinkSync(filePath?: string) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete ${filePath}`, err);
  }
}

function extractAudio(projectPath: string): Promise<string> {
  const audioPath = `/tmp/projectAudio-${Date.now()}.mp3`;
  const videoOnlyPath = `/tmp/video-only-${Date.now()}.mp4`;

  return new Promise((resolve, reject) => {
    ffmpeg(projectPath)
      .output(audioPath)
      .outputOptions([
        "-map 0:a?",
        "-c:a libmp3lame",
        "-b:a 192k",
      ])
      .output(videoOnlyPath)
      .outputOptions([
        "-map 0:v",
        "-c:v copy",
        "-an",
      ])
      .on("end", () => {
        fs.renameSync(videoOnlyPath, projectPath);
        resolve(audioPath);
      })
      .on("error", reject)
      .run();
  });
}

function mixTuneWithAudio(
  voicePath: string,
  tunePath: string
): Promise<string> {
  // Extract just the filename and create new output name
  const baseFilename = path.basename(voicePath, '.mp3');
  const outputPath = path.join('/tmp', `${baseFilename}-with-tune.mp3`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(voicePath)
      .input(tunePath)
      .complexFilter([
        `[0:a]volume=1.4[a0];` +
        `[1:a]aloop=loop=-1:size=2e+09,volume=0.15[a1];` +
        `[a0][a1]amix=inputs=2:duration=first[a]`
      ])
      .outputOptions([
        "-map [a]",
        "-c:a libmp3lame",
        "-b:a 192k"
      ])
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject);
  });
}

function mergeAudioWithVideo(
  audio: string,
  video: string
): Promise<string> {
  const outputPath = `/tmp/final-video-${Date.now()}.mp4`;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(video)
      .input(audio)
      .outputOptions([
        "-map 0:v:0",
        "-map 1:a:0",
        "-c:v copy",
        "-c:a aac",
      ])
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject);
  });
}

export async function addTune(projectId: string) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId }
    });

    if(project?.hasTune) return {message: "Tune already added", success: false}

    const tuneId = project?.tuneId;
    const projectUrl = project?.finalUrl;

    if (!tuneId || !projectUrl) {
      return { message: "Tune not found", success: false};
    }

    const tune = await prisma.tunes.findFirst({
      where: { id: tuneId },
      select: { url: true },
    });

    if (!tune) {
      return { message: "Tune not found", success: false};
    }

    // Download files - pass just the filename
    await downloadFile(projectUrl, `/tmp/project-${Date.now()}.mp4`);
    await downloadFile(tune.url, `/tmp/tune-${tuneId}.mp3`);

    paths.projectAudioPath = await extractAudio(paths.projectPath);

    paths.finalAudioPath = await mixTuneWithAudio(
      paths.projectAudioPath,
      paths.tunePath
    );

    paths.finalVideoPath = await mergeAudioWithVideo(
      paths.finalAudioPath,
      paths.projectPath
    );

    const finalUrl = await uploadVideoToCloudinary(
      new Blob([fs.readFileSync(paths.finalVideoPath)]),
      "final"
    );

    await prisma.project.update({
      where: { id: projectId },
      data: { 
        finalUrl: finalUrl,
        hasTune: true
       }
    });

    return { message: "Tune added Successfully", finalUrl: finalUrl, success: true};

  } catch (error) {
    console.error("Error adding tune:", error);
    return { message: "Error while adding tune", success: false };

  } finally {
    safeUnlinkSync(paths.projectPath);
    safeUnlinkSync(paths.tunePath);
    safeUnlinkSync(paths.projectAudioPath);
    safeUnlinkSync(paths.finalAudioPath);
    safeUnlinkSync(paths.finalVideoPath);
  }
}