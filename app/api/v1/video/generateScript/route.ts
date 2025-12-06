import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession(){
    return await getServerSession(authOptions);
}

export async function getUserId(){
    const session = await getSession();
    return session?.user?.id ?? null;
}

//Generate Script
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId();
        if(!userId) {
            return NextResponse.json({message: "User not authenticated", success: false}, {status: 401});
        }
        const body = await req.json();  
        const idea = body.idea;
        const expectedVideoLength = body.expectedVideoLength;
        const basePrompt = `
Write a cinematic-style voiceover narration (~${Math.floor(expectedVideoLength * 2.5)} words, roughly ${expectedVideoLength}s) for a YouTube short.

Topic: ${idea}

Guidelines:
- Write only the narration as plain text paragraphs.
- Do NOT include stage directions, sound cues, or screenplay formatting (no [SCENE], (SOUND:), or NARRATOR labels).
- Use natural, flowing sentences that sound powerful when spoken aloud.
- Start with a strong hook or question that captures attention instantly. 
- Begin with a dramatic hook about the event.
- Build momentum by describing the response, courage, or outcome.
- End with an inspiring and emotional note.
- Maintain a serious, respectful, and cinematic tone.

Example of desired format:
“In September 2021, a shocking attack rocked Pahalgam, leaving the nation in disbelief. But India responded with swift determination…”
`;

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
        if(!res.ok){
            return NextResponse.json({message: "Failed to generate script", success: false}, {status: 500});
        }
        const data = await res.json();
        const title = idea.split(" ").slice(0, 4).join(" ");
        const generatedScript: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        await prisma.project.create({
            data: {
                userId: Number(userId),
                title: title,
                script: generatedScript,
                expectedLength: expectedVideoLength
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
        return NextResponse.json({ message: "Internal Server Error", success: false }, {status: 500})
    }
}

