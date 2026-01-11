'use server';

import { downloadFile } from "@/app/lib/downloadFiles";
import prisma from "@/app/lib/db";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import fs from "fs";
import { uploadVideoToCloudinary } from "@/app/lib/cloudinary/uploadVideoToCloudinary";

const paths = {
  projectPath: "",
  tunePath: "",
  projectAudioPath: "",
  finalAudioPath: "",
  finalVideoPath: "",
};

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

function safeUnlinkSync(filePath?: string) {
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
  const audioPath = `projectAudio-${Date.now()}.mp3`;
  const videoOnlyPath = `video-only-${Date.now()}.mp4`;

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
  const outputPath = `${voicePath.replace(".mp3", "")}-with-tune.mp3`;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(voicePath)
      .input(tunePath)
      .complexFilter([
        `[1:a]aloop=loop=-1:size=2e+09,volume=0.2[a1];` +
        `[0:a][a1]amix=inputs=2:duration=first[a]`
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
  const outputPath = `final-video-${Date.now()}.mp4`;

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

    const tuneId = project?.tuneId;
    const projectUrl = project?.finalUrl;

    if (!tuneId || !projectUrl) {
      return { message: "Tune not found" };
    }

    const tune = await prisma.tunes.findFirst({
      where: { id: tuneId },
      select: { url: true },
    });

    if (!tune) {
      return { message: "Tune not found" };
    }

    paths.projectPath = `project-${Date.now()}.mp4`;
    paths.tunePath = `tune-${tuneId}.mp3`;

    await downloadFile(projectUrl, paths.projectPath);
    await downloadFile(tune.url, paths.tunePath);

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
      data: { finalUrl }
    });

    return { message: "Tune added Successfully", finalUrl: finalUrl};

  } catch (error) {
    console.error(error);
    return { message: "Error while adding tune" };

  } finally {
    safeUnlinkSync(paths.projectPath);
    safeUnlinkSync(paths.tunePath);
    safeUnlinkSync(paths.projectAudioPath);
    safeUnlinkSync(paths.finalAudioPath);
    safeUnlinkSync(paths.finalVideoPath);
  }
}
