import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { downloadFile } from "@/app/lib/downloadFiles";
import { cloudinary } from "@/app/lib/cloudinary";
import fs from 'fs'
import { updateStatus } from "../generateScenes/route";

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
  const roundedDuration = Math.ceil(duration);

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(`color=size=720x1280:duration=${roundedDuration}:rate=30:color=black`)
      .inputFormat('lavfi')
      .input(imagePath)
      .loop(duration)
      // Your audio
      .input(audioPath)
      // Motion effect
      .complexFilter([
        `[1]scale=820:1380,format=rgba[img];` +
        `[0][img]overlay=` +
        `x='(W/2-w/2)+15*cos(2*PI*t/${roundedDuration/1.5})':` +
        `y='(H/2-h/2)+7*sin(2*PI*t/${roundedDuration/1.5})':` +
        `shortest=1[v]`
      ])
      .outputOptions([
        "-map [v]",
        "-map 2:a",
        "-pix_fmt yuv420p",
        "-r 60",
        "-c:v libx264",
        "-shortest",
        `-t ${duration}`,
      ])
      .save(output)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg error:", err.message);
        reject(err);
      });
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
            },
            orderBy: {
                sceneNumber: "asc"
            }
        })

        updateStatus(projectId, "Generating Queue");
        const outputs = [];
        let previousEndTime = 0;
        for (let i = 0; i < assets.length; i++) {
            const imagePath = `scene_${i + 1}.jpg`;
            const audioPath = `audio_${i + 1}.mp3`;
            
            await downloadFile(assets[i].url, imagePath);
            await downloadFile(audios[i].url || '', audioPath);

            const duration = await getAudioDuration(audioPath)

            const output = await mergeImageWithAudios({ imagePath, audioPath, index: i, duration });
            fs.unlinkSync(imagePath);
            fs.unlinkSync(audioPath);

            const startTime = previousEndTime;
            const endTime = startTime + Number(duration);
            outputs.push({
                url: output.url,
                endTime: endTime,
                startTime: startTime
            });
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

        console.log(outputs);
        

        const res = await fetch(`${process.env.BASE_URL}/api/v1/video/wholeMergedVideo`, {
            method: 'POST',
            headers: {
                "Content-type": 'application/json',
                "Accept": "application/json"
            },
            body: JSON.stringify({
                outputs,
                projectId
            })
        })
        const resData = await res.json();
        return NextResponse.json({ message: resData.message, url: resData.url})
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
}
