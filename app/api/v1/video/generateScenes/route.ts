import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { uploadToCloudinary } from "../../uploadFiles/route";
import fs from "fs";
import { updateSceneStatus } from "@/app/lib/updateSceneStatus";

export async function updateProjectStatus(projectId: string, status: string) {
    await prisma.project.update({
        where: {
            id: projectId
        },
        data: {
            status: status
        }
    })
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const projectId = data.projectId;
        const type = data.type
        const generationPreset = data.generationPreset;
        const aspectRatio = data.aspectRatio;
        const voiceId = data.voiceId;
        const tuneId = data.tuneId;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';


        await updateProjectStatus(projectId, "Generating Scenes");
        //getting project with script
        const project = await prisma.project.findFirst({
            where: {
                id: projectId
            }
        })
        if (!project) return NextResponse.json({ message: "Project not found", success: false }, { status: 404 })
        const script = project.script;
        const expectedLength = project.expectedLength;

        const basePrompt = `You are a professional scene designer for short-form videos (e.g., YouTube Shorts, Reels, TikToks).  
Your task is to break down the given script into a list of visually compelling scenes, based on the provided inputs.

### Inputs:
- Script: ${script}
- Target Video Length (seconds): ${expectedLength || 30}
- Scene Type: ${type}  (e.g., "animate" or "photos")
- Generation Preset: ${generationPreset}  (e.g., "4k realistic", "line art", "cartoon")
- Photo Size: ${aspectRatio} (e.g., "9:16", "16:9", "1:1")

### Instructions:
1. Break the script into concise **scene descriptions**, ensuring the total number of scenes matches the approximate target video length.
2. Each scene should be **visually descriptive**, indicating what should appear, camera angle (if needed), and mood.
3. The **style** of the scenes must strictly follow the “Generation Preset”.
4. The **Scene Type** determines how the visual should be interpreted:
   - If "animate": imagine smooth animations or animated shots.
   - If "photos": imagine realistic or stylized photo-like frames.
5. Include timestamps for each scene to fit the total video length.
6. Return the output in **JSON format** with the following structure:
{
  "scenes": [
    {
      "id": 1,
      "startTime": "0s",
      "endTime": "5s",
      "description": "Describe the scene visually and cinematically here.",
      "style": "${generationPreset}",
      "type": "${type}",
      "aspectRatio": "${aspectRatio}"
    }
  ]
}
`


        //getting different scenes on the basis of script
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: basePrompt }],
                    },
                ],
            })
        })
        if (!res.ok) {
            throw new Error(`Gemini API Error: ${res.statusText}`);
        }
        const generatedScenesRes = await res.json();
        const generatedText = generatedScenesRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const cleanedText = generatedText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        const generatedJson = JSON.parse(cleanedText);
        const generatedScenes = generatedJson.scenes;

        const scenes = [];
        //adding to the database
        for (const scene of generatedScenes) {
            const createdScene = await prisma.scene.create({
                data: {
                    projectId,
                    sceneNumber: Number(scene.id),
                    startTime: scene.startTime,
                    endTime: scene.endTime,
                    description: scene.description
                }
            });
            scenes.push(createdScene);
        }

        console.log(scenes);
        await updateProjectStatus(projectId, "Generating Voiceover Script");
        //generating voiceover script
        const voiceRes = await fetch(`${baseUrl}/api/v1/audio/scriptForVoice`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                // 'Cookie': req.headers.get('cookie') || ''
            },
            body: JSON.stringify({
                project: project,
                scenes: scenes
            })
        })

        const voiceData = await voiceRes.json();


        await updateProjectStatus(projectId, "Generating Assets");
        let projectProgress = 0;
        const finalOutputPath = `finalOutput_${projectId}.mp4`;
        let i = 0;
        for (const scene of scenes) {
            //making assets according to scene
            const res = await fetch(`${baseUrl}/api/v1/video/generateAssets`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    description: scene.description,
                    aspectRatio: aspectRatio,
                    projectId: projectId,
                    sceneNumber: scene.sceneNumber,
                    style: generationPreset
                })
            })
            const data = await res.json();


            //generate audio
            const audio = await prisma.audio.findFirst({
                where: {
                    sceneId: scene.id,
                    projectId: projectId,
                }
            })
            if (!audio) {
                throw new Error("Audio not found")
            }

            const audioRes = await fetch(`${baseUrl}/api/v1/audio/generateVoice`, {
                method: 'POST',
                headers: {
                    "Content-type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    voice: voiceId,
                    audioId: audio.id,
                    audioText: audio.text
                })
            })

            const audioData = await audioRes.json();
            const audioUrl = audioData.audio;


            //adding audio, animation to the scenes
            const mergeRes = await fetch(`${baseUrl}/api/v1/video/addAudioToScenes`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    audioUrl: audioUrl,
                    imageUrl: data.url,
                    scene: scene,
                    progress: projectProgress,
                    outputPath: finalOutputPath,
                    index: i
                })
            })
            const mergeData = await mergeRes.json();
            projectProgress = Number(mergeData.sceneEndTime);
            i++;
            await updateSceneStatus(scene.id, "Generated");
        }

        // upload final output once after all scenes are processed
        const finalOutputRes = await uploadToCloudinary(new Blob([fs.readFileSync(finalOutputPath)]), "final");
            await prisma.project.update({
                where: {
                    id: projectId
                },
                data: {
                    finalUrl: finalOutputRes
                }
            })

        await updateProjectStatus(projectId, "Generated");


        return NextResponse.json({ message: "Scenes and Images Generated", success: true, scenes: generatedScenes });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false })
    }
}