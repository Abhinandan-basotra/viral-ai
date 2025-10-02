import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

//Generate Script
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const idea = body.idea;
        const expectedVideoLength = body.expectedVideoLength;

        const basePrompt = `You are a professional short-form content scriptwriter for Instagram Reels, YouTube Shorts, and TikTok. Write a powerful and cinematic narration script in English (${expectedVideoLength}) for voiceover. \n\nRequirements:\n- Start with a strong hook in the first line.\n- Build up the concept with vivid, punchy narration.\n- Add a twist or thought-provoking question near the end.\n- End with a strong, impactful closing line.\n- Use short sentences. No dialogues.\n- Do NOT include scenes, camera directions, or screenplay formatting. The output must be a single continuous voiceover narration, like spoken commentary.\n\nStory idea: ${idea}.\nTone: Futuristic and suspenseful.`
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
        const data = await res.json();
        
        const generatedScript: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        await prisma.project.create({
            data: {
                userId: 1,
                title: "efef",
                script: generatedScript,
            }
        })
        return NextResponse.json(
            {
                message: "Script Generated",
                success: true,
                generatedScript
            },
            { status: 200 }
        );

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false })
    }
}

export async function GET(req: NextRequest){

}