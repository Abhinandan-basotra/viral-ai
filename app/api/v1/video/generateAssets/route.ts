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


//temporary
import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "../../uploadFiles/route";
import OpenAI from "openai";
import fs from 'fs'

export async function POST(req: NextRequest){
    try {
        const data = await req.json();
        const description = data.description;
        const type = data.type;//generation Preset
        const style = data.style;
        const aspectRatio = data.aspectRatio;
        const projectId = data.projectId;
        const sceneId = data.sceneId;

        const prompt = `
            Generate an image based on the following details:
            Description: ${description}
            Style / Generation Preset: ${style} (e.g., 4K realistic, cinematic, anime, digital art, etc.)
            Aspect Ratio: ${aspectRatio}
            Project ID: ${projectId}
            Scene ID: ${sceneId}
            Type: ${type}

            The image should visually represent the scene described, following the specified generation preset style and aspect ratio. 
            Ensure the final result looks coherent, visually appealing, and accurately reflects the given description and mood.
        `;

        const response = await fetch(`https://image.pollinations.ai/prompt/${prompt}`)
        const buffer = await response.arrayBuffer();
        const imageUrl = await uploadToCloudinary(new Blob([buffer]), "default_folder");
        return NextResponse.json({ message: "Image generated", success: true, imageUrl });

    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false}, {status: 500})
    }
}