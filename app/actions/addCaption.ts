'use server';
import { downloadFile } from "../lib/downloadFiles";
import { convert_speech_to_text } from "./speech-to-text";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import prisma from "../lib/db";
import { uploadVideoToCloudinary } from "../lib/cloudinary/uploadVideoToCloudinary";
import fs from 'fs';
import { safeUnlinkSync } from "./addTune";


const paths = {
    videoPath: '',
    subtitleFilePath: '',
    finalOutput: ''
}

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function clubCaptionsAndVideo(
    videoPath: string,
    subtitleFilePath: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const outputPath = "final_with_captions.mp4";

        ffmpeg(videoPath)
            .outputOptions([
                "-vf",
                `subtitles=${subtitleFilePath}:force_style='Fontsize=18,Alignment=2'`,
                "-c:v libx264",
                "-preset fast",
                "-c:a copy"
            ])
            .output(outputPath)
            .on("start", cmd => {
                console.log("FFmpeg command:", cmd);
            })
            .on("end", () => resolve(outputPath))
            .on("error", reject)
            .run();
    });
}



export async function addCaption(videoUrl: string, projectId: string) {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId
            },
            select: {
                hasCaption: true
            }
        })
        if(project?.hasCaption) return {message: "Already added", success: false};
        paths.videoPath = `video_temp.mp4`;
        await downloadFile(videoUrl, paths.videoPath);

        const subtitleFilePath = await convert_speech_to_text(paths.videoPath);

        const finalOutput = await clubCaptionsAndVideo(paths.videoPath, subtitleFilePath);

        const finalUrl = await uploadVideoToCloudinary(
            new Blob([fs.readFileSync(finalOutput)]),
            "final"
        );

        await prisma.project.update({
            where: {
                id: projectId
            },
            data: {
                finalUrl: finalUrl,
                hasCaption: true
            }
        })
        return { message: "Caption added", success: true, finalUrl: finalUrl };
    } catch (error) {
        console.log(error);
        return {message: "Unable to add Caption, try again", success: false}
    } finally {
        safeUnlinkSync(paths.finalOutput);
        safeUnlinkSync(paths.subtitleFilePath);
        safeUnlinkSync(paths.videoPath);
    }
}