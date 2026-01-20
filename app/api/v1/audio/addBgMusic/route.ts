import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import fs from "fs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { downloadFile } from "@/app/lib/downloadFiles";
import { uploadAudioToCloudinary } from "@/app/lib/cloudinary/uploadAudioToCloudinary";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}
if (ffprobeStatic) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
}

export async function POST(req: NextRequest) {
    try {
        const { id: tune_id, projectId } = await req.json();

        const audios = await prisma.audio.findMany({
            where: { projectId },
            orderBy: { createdAt: "asc" },
        });

        const tune = await prisma.tunes.findFirst({
            where: { id: tune_id },
        });

        if (!tune || !tune.url) {
            return NextResponse.json(
                { message: "Tune not found", success: false },
                { status: 404 }
            );
        }

        let tuneOffset = 0; 
        

        for (const audio of audios) {
            let voicePath = `/tmp/voice-${audio.id}.mp3`;
            let bgPath = `/tmp/bg-${audio.id}.mp3`;
            const outputPath = `/tmp/merged-${audio.id}.mp3`;

            if (audio.url) {
                await Promise.all([
                    downloadFile(audio.url, voicePath),
                    downloadFile(tune.url, bgPath),
                ]);
            }

            const voiceDuration = await new Promise<number>((resolve, reject) => {
                ffmpeg.ffprobe(voicePath, (err, metadata) => {
                    if (err) reject(err);
                    else resolve(metadata.format.duration || 0);
                });
            });

            const mergedUrl = await new Promise<string>((resolve, reject) => {
                ffmpeg()
                    .input(voicePath)
                    .input(bgPath)
                    .complexFilter([
                        `[1:a]atrim=start=${tuneOffset}:end=${tuneOffset + voiceDuration},volume=0.2[a1]; [0:a][a1]amix=inputs=2:duration=first[a]`
                    ])
                    .outputOptions(["-map [a]", "-c:a mp3"])
                    .save(outputPath)
                    .on("end", async () => {
                        const mergedBuffer = fs.readFileSync(outputPath);
                        const cloudUrl = await uploadAudioToCloudinary(mergedBuffer, "merged");
                        fs.unlinkSync(voicePath);
                        fs.unlinkSync(bgPath);
                        fs.unlinkSync(outputPath);
                        resolve(cloudUrl.url);
                    })
                    .on("error", reject);
            });

            await prisma.audio.update({
                where:{
                    id: audio.id
                },
                data: {
                    url: mergedUrl
                }
            });

            tuneOffset += voiceDuration; 
        }


        return NextResponse.json({
            success: true,
            message: "All audios merged successfully",
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal Server Error", success: false },
            { status: 500 }
        );
    }
}
