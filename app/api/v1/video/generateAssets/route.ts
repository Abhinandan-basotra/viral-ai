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
import { uploadToCloudinary } from "../../uploadFiles/route";

//temporary
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob;
        const projectIdValue = formData.get("projectId");
        if (!projectIdValue) {
            return NextResponse.json({ message: "Missing projectId", success: false }, { status: 400 });
        }
        const projectId = projectIdValue.toString();
        const typeValue = formData.get("type");
        if(!typeValue) return NextResponse.json({ message: "Missing typeValue", success: false }, { status: 400 });
        const type = typeValue.toString();
        const folder = "default_folder"
        const sceneId = formData.get('sceneId')?.toString();

        const imageUrl = await uploadToCloudinary(file, folder);

        const asset = await prisma.asset.create({
            data: {
                projectId: projectId,
                type: type,
                url: imageUrl,
                status: "Image Stored",
                scenes: {
                    connect: {id: sceneId}
                }
            },
        });
        return NextResponse.json({ message: "Asset stored", success: true, asset });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 })
    }
}