// #region code to be more polish
// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from 'openai'
// import fs from 'fs'

// export async function POST(req: NextRequest) {
//     try {
//         const data = await req.json();
//         const description = data.description;
//         // const type = data.type;
//         // const aspectRatio = data.aspectRatio;
//         // const startTime = data.startTime;
//         // const endTime = data.endTime;

//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${process.env.IMAGE_GENERATION_KEY}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 model: "google/gemini-2.5-flash-image-preview",
//                 messages: [
//                     {
//                         role: "user",
//                         content: [
//                             {
//                                 type: "text",
//                                 text: "A cute rabbit holding a carrot, 4k realistic",
//                             },
//                         ],
//                     },
//                 ],
//             }),
//         });

//         const result = await response.json();
//         console.log(result);

//         const content = result?.choices?.[0]?.message;

//         let imageUrl: string | undefined;

//         if (Array.isArray(content?.images) && content.images.length > 0) {
//             imageUrl = content.images;
//         }

//         console.log("🖼️ Generated Image URL:", imageUrl);

//         return NextResponse.json({ message: "fetched" });

//     } catch (error) {
//         console.log(error);
//         return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
//     }
// }
// #endregion

import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
//temporary
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const url = body.url;
        const projectId = body.projectId;
        const type = body.type;

        const cloudinaryRes = await fetch(`${process.env.BASE_URL}/api/v1/uploadFiles`, {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: url
            })
        })

        const resData = await cloudinaryRes.json();

        if (!cloudinaryRes.ok) {
            return NextResponse.json(
                { message: "Failed to upload to Cloudinary", success: false, error: resData },
                { status: 500 }
            );
        }

        await prisma.asset.create({
            data: {
                projectId: projectId,
                type: type,
                url: resData.url,
                status: "uploaded"
            }
        })
        return NextResponse.json({ message: "Asset stored", success: false });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
}