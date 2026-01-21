'use server';
import { downloadFile } from "../lib/downloadFiles";
import { convert_speech_to_text } from "./speech-to-text";
import ffmpeg from 'fluent-ffmpeg';
import { getDuration } from "@/app/lib/ffmpegUtils";
import prisma from "../lib/db";
import { uploadVideoToCloudinary } from "../lib/cloudinary/uploadVideoToCloudinary";
import fs from 'fs';
import { safeUnlinkSync } from "./addTune";

async function clubCaptionsAndVideo(
    videoPath: string,
    subtitleFilePath: string
): Promise<string> {
    const outputPath = `/tmp/final_${Date.now()}.mp4`;

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .videoFilter(`ass=${subtitleFilePath}`)
            .outputOptions([
                "-c:v libx264",
                "-preset fast",
                "-crf 23",
                "-c:a copy"
            ])
            .output(outputPath)
            .on("start", cmd => console.log("FFmpeg:", cmd))
            .on("end", () => resolve(outputPath))
            .on("error", reject)
            .run();
    });
}




export async function addCaption(videoUrl: string, projectId: string) {
    let videoPath = "";
    let subtitlePath = "";
    let finalOutput = "";

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { hasCaption: true }
        });

        if (project?.hasCaption) {
            return { success: false, message: "Already added" };
        }

        videoPath = `/tmp/video_${Date.now()}.mp4`;
        await downloadFile(videoUrl, videoPath);

        subtitlePath = await convert_speech_to_text(videoPath);

        finalOutput = await clubCaptionsAndVideo(videoPath, subtitlePath);

        const finalUrl = await uploadVideoToCloudinary(
            new Blob([fs.readFileSync(finalOutput)]),
            "final"
        );

        await prisma.project.update({
            where: { id: projectId },
            data: {
                finalUrl,
                hasCaption: true
            }
        });

        return {
            success: true,
            message: "Caption added",
            finalUrl
        };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Unable to add captions" };
    } finally {
        safeUnlinkSync(videoPath);
        safeUnlinkSync(subtitlePath);
        safeUnlinkSync(finalOutput);
    }
}
