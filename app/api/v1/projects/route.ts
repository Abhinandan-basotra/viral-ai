import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/db";


//getAllProjects
export async function GET(req: NextRequest){
    try {
        const session = await getServerSession(authOptions);
        if(!session || !session.user.id) return NextResponse.json({message: "User Not authenticated", success: false}, {status: 404});
        const projects = await prisma.project.findMany({
            where:{
                userId: Number(session.user.id)
            }
        })
        
        return NextResponse.json({message: "All Projects Fetched Successfully", success: true, projects}, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Internal Server Error", success: false});
    }
}