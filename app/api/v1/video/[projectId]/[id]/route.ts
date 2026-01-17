import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

type Params = {
    projectId: string;
    id: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { projectId, id } = await params;
        const project = await prisma.project.findFirst({
            where: {
                id: projectId
            }
        })
        if(!project) return NextResponse.json({message: "Project not found", success: false}, {status: 404});

        const progress = project.progress;
        const lastScene = await prisma.scene.findFirst({
            where: {
                id: id,
                projectId: projectId
            }
        })
        if (!lastScene) {
            const allScenes = await prisma.scene.findMany({
                where: {
                    projectId: projectId
                },
                orderBy: {
                    updatedAt: "asc"
                }
            });
            return NextResponse.json({ allScenes, success: true, project: project.finalUrl, progress: project.progress, projectStatus: project.status }, { status: 200 })
        }

        const neededScenes = await prisma.scene.findMany({
            where: {
                projectId: projectId,
                updatedAt: {
                    gt: lastScene.updatedAt
                }
            },
            orderBy: {
                updatedAt: "asc"
            }
        })
        if (!neededScenes) return NextResponse.json({ project: project.finalUrl, progress: project.progress, projectStatus: project.status})
        return NextResponse.json({ messsage: 'Needed Scenes Fetched', neededScenes, success: true, progress: progress, project: project.finalUrl, projectStatus: project.status }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}