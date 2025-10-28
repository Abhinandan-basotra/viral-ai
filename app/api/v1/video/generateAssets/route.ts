
//temporary
import { uploadImageToCloudinary } from "@/app/lib/cloudinary/uploadImageToCloudinary";
import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        const data = await req.json();
        const description = data.description;
        //const type = data.type;
        const style = data.style;
        const aspectRatio = data.aspectRatio;
        const projectId = data.projectId;
        const sceneNumber = data.sceneNumber;

        const prompt = `
            Generate an image based on the following details:
            Description: ${description}
            Style / Generation Preset: ${style} (e.g., 4K realistic, cinematic, anime, digital art, etc.)
            Aspect Ratio: ${aspectRatio}
            Project ID: ${projectId}
            Scene Number: ${sceneNumber}
            Type: image

            The image should visually represent the scene described, following the specified generation preset style and aspect ratio. 
            Ensure the final result looks coherent, visually appealing, and accurately reflects the given description and mood.
        `;

        const response = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` , {
            headers: { Accept: "image/*" }
        })
        if (!response.ok) {
            return NextResponse.json({ message: "Image generator failed", success: false }, { status: 502 });
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
            return NextResponse.json({ message: "Upstream did not return an image", success: false }, { status: 502 });
        }
        const buffer = await response.arrayBuffer();
        if (!buffer || buffer.byteLength === 0) {
            return NextResponse.json({ message: "Received empty image buffer", success: false }, { status: 502 });
        }
        const imageUrl = await uploadImageToCloudinary(new Blob([buffer]), "default_folder");
        // resolve the persisted scene record by project and sceneNumber
        const sceneRecord = await prisma.scene.findFirst({
            where: {
                projectId: projectId,
                sceneNumber: Number(sceneNumber)
            }
        });
        const asset = await prisma.asset.create({
            data:{
                projectId: projectId,
                type: "image",
                url: imageUrl,
                status: "generated",
                scenes: sceneRecord ? { connect: { id: sceneRecord.id } } : undefined
            }
        })
        return NextResponse.json({ message: "Image generated", success: true, url: imageUrl });

    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false}, {status: 500})
    }
}