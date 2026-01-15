'use server';
import prisma from "@/app/lib/db";

export default async function addProjectScript(script: string, title: string | null, userId: string){
    
    const project = await prisma.project.create({
        data: {
            userId: userId,
            title: title || 'Video',
            script: script
        }
    })
    return project.id;
}