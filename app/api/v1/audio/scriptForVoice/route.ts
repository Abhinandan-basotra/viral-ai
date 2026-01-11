import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { updateProjectStatus } from "../../video/generateScenes/route";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const scenes = data.scenes;
        const project = data.project;
        const projectId = project.id;
        updateProjectStatus(projectId, "Generating Voiceover Script");
        let combined_script = "";
        for (const scene of scenes) {
            combined_script += `Scene${scene.sceneNumber}: ${scene.description}\n`
        }

let basePrompt = `You are a professional voice-over scriptwriter for ElevenLabs v3 TTS.

TASK:
Generate a voice-over narration script from the scene outline below, optimized for natural speech pacing.

INPUT:
- Scene outline: ${combined_script}
- Target duration: ${project?.expectedLength} seconds
- Story concept: ${project?.script}

REQUIREMENTS:

1. **Pacing & Rhythm**:
   - Write for NATURAL speaking speed (aim for ~150-180 words per minute)
   - Use audio tags SPARINGLY (max 2-3 per scene)
   - Avoid ellipses unless necessary for dramatic effect
   - Use commas for natural breathing, periods for clear stops

2. **ElevenLabs v3 Audio Tags** (use only when essential):
   - Emotion: [sad], [happy], [angry], [fearful], [curious]
   - Delivery: [whispers], [shouts], [dramatic tone], [calm]
   - Timing: [pause] (use rarely), [rushed], [drawn out]
   - Effects: [laughs], [sighs], [clears throat]
   - Accents: [French accent], [British accent], etc.

3. **Scene Structure**:
   - Label each scene (Scene 1, Scene 2...)
   - Estimate duration per scene (in seconds)
   - Balance script length with target duration

4. **Voice Style**:
   - Suggest gender, tone, and delivery style
   - Include optimal stability (0.4-0.8, default 0.5) and similarity_boost (0.5-1.0, default 0.75)

OUTPUT FORMAT (JSON only, no markdown):
{
  "voice_over_script": [
    {
      "scene": "Scene 1",
      "duration_sec": 8,
      "narration": "In the beginning, there was silence. Then came the hum of machines, breathing life into cold steel."
    },
    {
      "scene": "Scene 2",
      "duration_sec": 6,
      "narration": "[whispers] Something stirs in the darkness. A consciousness, awakening."
    }
  ],
  "voice_style": "male, deep and cinematic, moderate pacing with subtle emotion",
  "stability": 0.5,
  "similarity_boost": 0.75
}

IMPORTANT:
- Prioritize natural flow over dramatic tags
- Keep sentences concise and clear
- Match total script length to expected duration
- Write conversationally, not like written prose
`;
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_2}`,
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


        if (!generatedString) {
            console.error("No valid text returned from Gemini:", resFromGemini);
            return NextResponse.json({
                message: "Gemini returned no content",
                success: false,
                rawResponse: resFromGemini
            }, { status: 500 });
        }


        let generatedJSON;
        try {
            generatedJSON = JSON.parse(generatedString);
        } catch (err) {
            console.error("Failed to parse JSON from Gemini:", err);
            generatedJSON = { error: "Invalid JSON returned", raw: generatedString };
        }


        for (const scene of scenes) {
            const sceneId = scene.id;
            const sceneNumber = scene.sceneNumber;
            await prisma.audio.create({
                data: {
                    sceneId: sceneId,
                    projectId: projectId,
                    type: "narration",
                    status: "Narration Script generated",
                    text: generatedJSON.voice_over_script[sceneNumber - 1].narration,
                    duration: generatedJSON.voice_over_script[sceneNumber - 1].duration_sec,
                    emotion: generatedJSON.voice_style,
                    voice_stability: generatedJSON.stability,
                    voice_similarity_boost: generatedJSON.similarity_boost
                }
            })
        }

        updateProjectStatus(projectId, "Voiceover Script Generated");

        return NextResponse.json({ message: "script Generated for voice over", success: true, generatedJSON: generatedJSON });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}