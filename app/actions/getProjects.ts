import { getServerSession } from "next-auth";
import prisma from "@/app/lib/db";
import { authOptions } from "../api/auth/[...nextauth]/route";


export async function getProjects(){
    try {
        const session = await getServerSession(authOptions);
        if(!session || !session.user.id) return {message: "User Not authenticated", success: false};
        const projects = await prisma.project.findMany({
            where:{
                userId: session.user.id
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        
        return {projects: projects, success: true}
    } catch (error) {
        console.log(error);
        return {message: "Internal Server Error", success: false}
    }
}