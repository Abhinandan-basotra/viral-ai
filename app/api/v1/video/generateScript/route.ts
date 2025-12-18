import { NextRequest, NextResponse } from "next/server";

//Generate Script
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();  
        const idea = body.idea;
        const expectedVideoLength = body.expectedVideoLength;
        const basePrompt = `
Write a narration (~${expectedVideoLength * 2} words) for a YouTube short.
Topic: ${idea}
Make it cinematic, emotional, and inspiring.
Only write the narration text. No labels. No scene descriptions.
Start with a strong hook and end with a powerful message.
`;
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API}`, {
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
            console.log(res);
            return NextResponse.json({message: "Error in Generating Script", success: false}, {status: 500});
        }
        const data = await res.json();
        const title = idea.split(" ").slice(0, 4).join(" ");
        const generatedScript: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return NextResponse.json(
            {
                message: "Script Generated",
                success: true,
                generatedScript,
                title
            },
            { status: 200 }
        );

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, {status: 500})
    }
}

