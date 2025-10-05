import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function updateStatus(projectId: string, status: string) {
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
        const type = data.type //type = animate, photo
        const generationPreset = data.generationPreset; //4k realistic, line art, cartoon etc
        const aspectRatio = data.aspectRatio;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        await updateStatus(projectId, "Generating Scenes");


        
        
        
        //getting project with script
        const response = await fetch(`${baseUrl}/api/v1/getProjectById/${projectId}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                // 'Cookie': req.headers.get('cookie') || ''
            }
        });
        const responseData = await response.json();
        const script = responseData.project.script;
        const expectedLength = responseData.project.expectedLength;

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
      "aspectRatio: "${aspectRatio}"
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

        const generatedScenesRes = await res.json();
        const generatedText = generatedScenesRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const cleanedText = generatedText
            .replace(/```json/g, '')  
            .replace(/```/g, '')    
            .trim();
        const generatedJson = JSON.parse(cleanedText);
        const generatedScenes = generatedJson.scenes;
        updateStatus(projectId, "Scenes Generated");

        for (const scene of generatedScenes) {
            //adding scene to the database
            await prisma.scene.create({
                data: {
                    projectId: projectId,
                    sceneNumber: Number(scene.id),
                    startTime: scene.startTime,
                    endTime: scene.endTime,
                    description: scene.description
                }
            });

            //making assets according to scene
            // const res = await fetch(`${baseUrl}/api/v1/video/generateAssets`,{
            //     method: 'POST',
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Accept": "application/json"
            //     },
            //     body: scene
            // })
            // const data = await res.json();
            // console.log(data.assets);
        }

        return NextResponse.json({ message: "Scenes and Images Generated", success: true, scenes: generatedScenes });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false })
    }
}