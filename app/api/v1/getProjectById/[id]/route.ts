import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET(req: NextRequest, {params}: {params: {id: string}}){
    try {
        const projectId = (await params).id;
        const project = await prisma.project.findFirst({
            where: {
                id: projectId
            }
        })
        if(project) return NextResponse.json({message: "Fetched Project", success: true, project})
        
        return NextResponse.json({message: "Not found", success: false}, {status: 404})
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "INternal Server Error", success: false});
    }
}