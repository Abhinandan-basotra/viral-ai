'use server';
import prisma from "@/app/lib/db";
import fs from 'fs'

export async function deleteVideo(projectId: string, outputPath: string) {
    try {
        await prisma.project.delete({
            where: {
                id: projectId
            }
        })
        if (outputPath && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        return { success: true }
    } catch (err) {
        console.log(err);
    }
};

export async function cancelProject(id: string){
    await prisma.project.update({
        where: {
            id: id
        },
        data: {
            status: 'Cancelled'
        }
    })
}