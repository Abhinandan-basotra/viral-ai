import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { downloadFile } from "@/app/lib/downloadFiles";
import { cloudinary } from "@/app/lib/cloudinary";
import fs from 'fs'

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

interface MergeInterface {
    imagePath: string,
    audioPath: string,
    index: number,
    duration: any
}

async function getAudioDuration(audioPath: string) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioPath, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
        });
    });
}



///function to merge audio and image
async function mergeImageWithAudios({ imagePath, audioPath, index, duration }: MergeInterface) {
    const output = `output_scene_${index + 1}.mp4`;

    await new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input(imagePath)
            .loop(duration)
            .input(audioPath)
            .outputOptions([
                "-c:v libx264",
                "-tune stillimage",
                `-t ${duration}`,
                "-pix_fmt yuv420p",
                "-vf scale=720:1280"
            ])
            .save(output)
            .on("end", () => {
                console.log(`Created ${output}`);
                resolve();
            })
            .on("error", reject);
    });

    try {
        const uploadRes = await cloudinary.uploader.upload(output, {
            resource_type: "video",
            folder: "generated_scenes",
            use_filename: true,
        });

        fs.unlinkSync(output);

        return {
            url: uploadRes.secure_url,
            duration: uploadRes.duration,
            public_id: uploadRes.public_id,
        };
    } catch (err) {
        throw err;
    }
}


export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const projectId = data.projectId;

        const assets = await prisma.asset.findMany({
            where: {
                projectId: projectId
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        const audios = await prisma.audio.findMany({
            where: {
                projectId: projectId
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        const scenes = await prisma.scene.findMany({
            where: {
                projectId: projectId
            }
        })

        const outputs = [];
        let previousEndTime = 0;
        for (let i = 0; i < assets.length; i++) {
            const imagePath = `scene_${i + 1}.jpg`;
            const audioPath = `audio_${i + 1}.mp3`;


            await downloadFile(assets[i].url, imagePath);
            await downloadFile(audios[i].url || '', audioPath);

            const duration = await getAudioDuration(audioPath)

            const output = await mergeImageWithAudios({ imagePath, audioPath, index: i, duration });

            outputs.push(output.url);
            fs.unlinkSync(imagePath);
            fs.unlinkSync(audioPath);

            const startTime = previousEndTime;
            const endTime = startTime + Number(duration);
            await prisma.scene.update({
                where: {
                    id: scenes[i].id
                },
                data: {
                    finalUrl: output.url,
                    startTime: `${startTime}s`,
                    endTime: `${endTime}s`
                }
            })
            previousEndTime = endTime
        }

        return NextResponse.json({ message: "done" })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
}
