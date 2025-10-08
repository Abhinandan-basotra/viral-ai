import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { updateStatus } from "../../video/generateScenes/route";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const projectId = await data.projectId;

        const scenes = await prisma.scene.findMany({
            where: {
                projectId: projectId
            }
        })
        const project = await prisma.project.findFirst({
            where: {
                id: projectId
            }
        })
        updateStatus(projectId, "Generating Voiceover Script");
        let combined_script = "";
        for (const scene of scenes) {
            combined_script += `Scene${scene.sceneNumber}: ${scene.description}\n`
        }
        let basePrompt = `You are a professional voice-over scriptwriter and you strictly use ElevenLabs v3 audio tags (as per ElevenLabs’ official list).  
I will give you a scene-by-scene outline of a story.  
Your job is to generate a **voice-over narration script** ready for Eleven v3, incorporating:

- **Only valid audio tags** from the official Eleven v3 list (e.g. [whispers], [shouts], [sad], [laughs], [pause], [dramatic tone], [rushed], [drawn out], [clears throat], [French accent], etc.).  
- **Ellipses**, **punctuation**, capitalization to manage rhythm, breaths, emphasis.  
- **Scene divisions** (Scene 1, Scene 2, etc.), with an **approximate duration** per scene in seconds.  
- **Do not alter the narrative meaning** — only enhance for voice-over.  
- At the end, add a **voice tone / delivery style** suggestion (e.g. “female, calm but emotionally expressive” or “male, dramatic and slow pacing”).

Here is the outline:  
script: 
${combined_script}
expected-time: ${project?.expectedLength}
overall-idea: ${project?.script}
Return JSON in the following format exactly:
{
  "voice_over_script": [
    {
      "scene": "Scene 1",
      "duration_sec": 5,
      "narration": "[curious] It begins with a glow... [pause] a spark of silicon thought."
    },
    {
      "scene": "Scene 2",
      "duration_sec": 4,
      "narration": "[calm] In sterile silence, steel hands perform miracles."
    }
  ],
  "voice_style": "male, deep, cinematic and reflective",
  "stability": 0.65,
  "similarity_boost": 0.8
};
`
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: basePrompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.7
                    },
                }),
            }
        );

        const resFromGemini = await res.json();
        const generatedString = resFromGemini.candidates?.[0]?.content?.parts?.[0]?.text;

        let generatedJSON;
        try {
            generatedJSON = JSON.parse(generatedString);
        } catch (err) {
            console.error("Failed to parse JSON from Gemini:", err);
            generatedJSON = { error: "Invalid JSON returned", raw: generatedString };
        }
        console.log(generatedJSON);
        
        
        for(const scene of scenes){
            const sceneId = scene.id;
            const sceneNumber = scene.sceneNumber;
            await prisma.audio.create({
                data: {
                    sceneId: sceneId,
                    projectId: projectId,
                    type: "narration",
                    status: "Narration Script generated",
                    text: generatedJSON.voice_over_script[sceneNumber-1].narration,
                    duration: generatedJSON.voice_over_script[sceneNumber-1].duration_sec,
                    emotion: generatedJSON.voice_style,
                    voice_stability: generatedJSON.stability,
                    voice_similarity_boost: generatedJSON.similarity_boost
                }
            })
        }

        updateStatus(projectId, "Voiceover Script Generated");
        
        return NextResponse.json({ message: "script Generated for voice over", success: true});

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}