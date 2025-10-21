import { NextRequest, NextResponse } from "next/server";
import { uploadAudioToCloudinary } from "../v1/uploadAudio/route";
import prisma from "@/app/lib/db";

export async function POST(req: NextRequest){
    try {
        const formData = await req.formData();
        const tune = formData.get("tune") as File;
        const name = formData.get("name");
        const description = formData.get("description");

        const arrayBuffer = await tune.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudUrl = await uploadAudioToCloudinary(buffer, "uploaded_tunes");

        const generatedTune = await prisma.tunes.create({
            data: {
                url: cloudUrl.url,
                name: String(name),
                description: String(description)
            }
        })

        return NextResponse.json({message: "tune added successfully", success: true, generatedTune});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false}, {status: 500});
    }
}

export async function GET(req: NextRequest){
    try {
        const tunes = await prisma.tunes.findMany();
        return NextResponse.json({message: "tunes fetched successfully", success: true, tunes});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false}, {status: 500})
    }
}