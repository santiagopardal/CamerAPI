const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


const getAllCameras = async () => {
    return prisma.camera.findMany(
        {
            include: {
                node: true,
                configurations: true,
            }
        }
    )
}


const getCamera = async (cameraId) => {
    return prisma.camera.findFirst(
        {
            where: { id: parseInt(cameraId, 10) },
            include: { node: true, configurations: true }
        }
    )
}


const getConfigurations = async (cameraId) => {
    return prisma.cameraConfigurations.findFirst(
        {
            where: { cameraId: parseInt(cameraId, 10) }
        }
    )
}


const createCamera = async (data) => {
    return prisma.camera.create({ data: data })
}


const updateCamera = async (cameraId, newData) => {
    return prisma.camera.update(
        {
            where: { id: parseInt(cameraId) },
            data: newData
        }
    )
}


const updateConfigurations = async (cameraId, newConfigurations) => {
    prisma.cameraConfigurations.update(
        {
            where: { cameraId: parseInt(cameraId, 10) },
            data: newConfigurations
        }
    )
}


const deleteCamera = async (cameraId) => {
    await prisma.cameraConfigurations.deleteMany(
        {
            where: { cameraId: parseInt(cameraId, 10) }
        }
    )

    return prisma.camera.delete(
        {
            where: {id: parseInt(cameraId, 10)}
        }
    )
}


module.exports = {
    getAllCameras,
    getCamera,
    getConfigurations,
    createCamera,
    updateCamera,
    updateConfigurations,
    deleteCamera
}
