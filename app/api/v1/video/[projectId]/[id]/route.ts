import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

interface RouteParam {
    params: {
        id: string,
        projectId: string
    }
}

export async function GET(req: NextRequest, { params }: RouteParam) {
    try {
        const { id } = await params;
        const { projectId } = await params;
        const project = await prisma.project.findFirst({
            where: {
                id: projectId
            }
        })
        if(!project) return NextResponse.json({message: "Project not found", success: false}, {status: 404});
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
            return NextResponse.json({ allScenes, success: true, project: project.finalUrl }, { status: 200 })
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
        if (!neededScenes) return NextResponse.json({ done: true })
        return NextResponse.json({ messsage: 'Needed Scenes Fetched', neededScenes, success: true }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}