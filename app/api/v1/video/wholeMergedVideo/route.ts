import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const outputs = data.outputs;
        const projectId = data.projectId;

        const outputPath = ""

        for(let i = 0; i < outputs.length; i++){
            //enter logic
            console.log("enter logic");
        }
        return NextResponse.json({message: "done"});
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false}, {status: 500})
    }
}