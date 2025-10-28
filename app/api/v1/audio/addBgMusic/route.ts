import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import axios from "axios";
import fs from "fs";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import { downloadFile } from "@/app/lib/downloadFiles";
import { uploadAudioToCloudinary } from "@/app/lib/cloudinary/uploadAudioToCloudinary";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

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

        const results = [];

        let tuneOffset = 0; // in milliseconds
        

        for (const audio of audios) {
            const voicePath = `/tmp/voice-${audio.id}.mp3`;
            const bgPath = `/tmp/bg-${audio.id}.mp3`;
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
