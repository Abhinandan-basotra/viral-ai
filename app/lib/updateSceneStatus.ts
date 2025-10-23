import prisma from "./db";
export async function updateSceneStatus(sceneId: string, status: string) {
    try {
        await prisma.scene.update({
            where: {
                id: sceneId
            },
            data: {
                status: status
            }
        })
    } catch (error) {
        console.log(error);
    }
}