'use server';

import prisma from "@/app/lib/db";

export async function isCancelled(projectId: string){
    const project = await prisma.project.findFirst({where:{id: projectId}, select: {status: true}})
    return project?.status === 'Cancelled'
}