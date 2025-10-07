import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function POST(req: NextRequest){
    try {
        const data = await req.json();
        const tune_id = data.id;
        const project_id = data.projectId;
        
        const audios = await prisma.audio.findMany({
            where:  {
                projectId: project_id
            },
            orderBy: { createdAt: "asc"}
        })

        const tune = await prisma.tunes.findFirst({
            where: {
                id: tune_id
            }
        })

        


    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false}, {status: 500});
    }
}