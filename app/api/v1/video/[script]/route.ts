import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";



export async function GET(req: NextRequest, { params }: { params: { script: string } }){
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;
        
        const projectid = (await params).script;
        console.log(projectid);
        
        if(!userId) return NextResponse.json({message: "User Not authenticated", success: false}, {status: 404});

        const project = await prisma.project.findUnique({
            where: {
                id: projectid,
                userId: Number(userId)
            }
        })
        
        if(!project) return NextResponse.json({message: "Project not found", success: false});
        return NextResponse.json({success: true, script: project.script});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false});
    }
}