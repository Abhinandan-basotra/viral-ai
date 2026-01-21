import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import { spawn } from "child_process";
import { downloadFile } from "@/app/lib/downloadFiles";
import { cloudinary } from "@/app/lib/cloudinary/cloudinary";
import fs from 'fs'
import path from "path";

// Set the paths for ffmpeg and ffprobe using direct paths
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log('FFmpeg path set to:', ffmpegPath);
} else {
  console.error('FFmpeg static path not found');
}

if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath.path);
  console.log('FFprobe path set to:', ffprobePath.path);
} else {
  console.error('FFprobe static path not found');
}

interface MergeInterface {
  imagePath: string,
  audioPath: string,
  index: number,
  duration: number
}

async function getAudioDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        // First check if file exists
        if (!fs.existsSync(audioPath)) {
            reject(new Error(`Audio file not found: ${audioPath}`));
            return;
        }

        // Use direct spawn call for better reliability
        const ffprobe = spawn(ffprobePath.path, [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            audioPath
        ]);

        let output = '';
        let errorOutput = '';

        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });

        ffprobe.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0) {
                const duration = parseFloat(output.trim());
                if (isNaN(duration)) {
                    reject(new Error(`Invalid duration output: ${output}`));
                } else {
                    resolve(duration);
                }
            } else {
                reject(new Error(`FFprobe failed with code ${code}: ${errorOutput}`));
            }
        });

        ffprobe.on('error', (err) => {
            reject(new Error(`FFprobe spawn error: ${err.message}`));
        });
    });
}



///function to merge audio and image
async function mergeImageWithAudios({ imagePath, audioPath, index, duration }: MergeInterface) {
    const output = `/tmp/output_scene_${index}.mp4`;
    const roundedDuration = Math.ceil(duration);

    await new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input(`color=size=720x1280:duration=${roundedDuration}:rate=30:color=black`)
            .inputFormat('lavfi')
            .input(imagePath)
            .loop(duration)
            .input(audioPath)
            .complexFilter([
                `[1]scale=820:1380,format=rgba[img];` +
                `[0][img]overlay=` +
                `x='(W/2-w/2)+14*cos(2*PI*t/${roundedDuration/3.5})':` +
                `y='(H/2-h/2)+7*sin(2*PI*t/${roundedDuration/3.5})':` +
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
                // Verify the output file was created
                if (fs.existsSync(output)) {
                    console.log(`Successfully created output file: ${output}`);
                    resolve();
                } else {
                    reject(new Error(`Output file was not created: ${output}`));
                }
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

        return {
            url: uploadRes.secure_url,
            duration: uploadRes.duration,
            public_id: uploadRes.public_id,
            mergedImageAudioPath: output
        };
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        // Clean up the output file if upload fails
        if (fs.existsSync(output)) {
            fs.unlinkSync(output);
        }
        throw err;
    }
}

//function to merge videos 
async function mergeVideos(
  temp1: string,
  temp2: string,
  output: string,
) {
  const duration1 = await new Promise<number>((resolve, reject) => {
    // Use direct spawn call for getting duration
    const ffprobe = spawn(ffprobePath.path, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      temp1
    ]);

    let output = '';
    let errorOutput = '';

    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        if (isNaN(duration)) {
          reject(new Error(`Invalid duration output: ${output}`));
        } else {
          resolve(duration);
        }
      } else {
        reject(new Error(`FFprobe failed with code ${code}: ${errorOutput}`));
      }
    });

    ffprobe.on('error', (err) => {
      reject(new Error(`FFprobe spawn error: ${err.message}`));
    });
  });

  const fadeDur = 0.5;
  const overlapStart = Math.max(0, duration1 - fadeDur);

  const filter = `
    [0:v]scale=720:1280,format=yuv420p,setsar=1,
         fade=t=out:st=${overlapStart}:d=${fadeDur}[v0];
    [1:v]scale=720:1280,format=yuv420p,setsar=1,
         fade=t=in:st=0:d=${fadeDur}[v1];
    [0:a]afade=t=out:st=${overlapStart}:d=${fadeDur}[a0];
    [1:a]afade=t=in:st=0:d=${fadeDur}[a1];
    [v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]
  `.replace(/\s+/g, "");

  return new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(temp1)
      .input(temp2)
      .complexFilter(filter)
      .outputOptions([
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
      ])
      .on("error", (err) => {
        console.error('FFmpeg merge error:', err);
        reject(err);
      })
      .on("end", () => {
        console.log('FFmpeg merge completed successfully');
        resolve();
      })
      .save(path.resolve(output));
  });
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const audioUrl = data.audioUrl;
        const imageUrl = data.imageUrl;
        const sceneId = data.sceneId;
        const projectProgress = data.progress;
        const finalOutputPath = data.outputPath;
        const index = data.index;
        
        console.log('Processing scene:', { sceneId, index, finalOutputPath });
        
        const scene = await prisma.scene.findFirst({
            where: {
                id: sceneId
            }
        })

        if (!scene) {
            throw new Error("Scene not found")
        }
        
        const imagePath = `/tmp/scene_${scene.sceneNumber}.jpg`;
        const audioPath = `/tmp/audio_${scene.sceneNumber}.mp3`;
        
        console.log('Downloading files:', { imageUrl, audioUrl, imagePath, audioPath });

        await downloadFile(imageUrl, imagePath);
        await downloadFile(audioUrl, audioPath);
        
        // Verify files were downloaded
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found after download: ${imagePath}`);
        }
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found after download: ${audioPath}`);
        }

        const duration: number = await getAudioDuration(audioPath)

        const output = await mergeImageWithAudios({ imagePath, audioPath, index: scene.sceneNumber, duration });
        fs.unlinkSync(imagePath);
        fs.unlinkSync(audioPath);

        

        const startTime = projectProgress;
        const endTime = startTime + Number(duration);
        await prisma.scene.update({
            where: {
                id: scene.id
            },
            data: {
                finalUrl: output.url,
                startTime: `${startTime}s`,
                endTime: `${endTime}s`
            }
        })

        if(index == 0){
            fs.copyFileSync(output.mergedImageAudioPath, finalOutputPath);
        }else{
            const tmpMerged = `/tmp/tmp_${index}.mp4`;
            await mergeVideos(finalOutputPath, output.mergedImageAudioPath, tmpMerged);
            try {
                if (fs.existsSync(tmpMerged)) {
                    fs.copyFileSync(tmpMerged, finalOutputPath);
                    fs.unlinkSync(tmpMerged);
                } else {
                    throw new Error(`Temporary merge file ${tmpMerged} was not created`);
                }
            } catch (error) {
                console.error('Error copying merged file:', error);
                throw error;
            }
        }

        // cleanup per-scene temp output after merging/copying
        try {
            if (fs.existsSync(output.mergedImageAudioPath)) {
                fs.unlinkSync(output.mergedImageAudioPath);
            }
        } catch {}

        return NextResponse.json({ message: "Audio added to scene", success: true, url: output.url, sceneEndTime: endTime, outputPath: output.mergedImageAudioPath });
    } catch (error) {
        console.error("error: ", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
}
