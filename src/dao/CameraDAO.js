const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


const getAllCameras = async () => {
    return prisma.camera.findMany(
        {
            include: { node: true }
        }
    )
}


const getCamera = async (cameraId) => {
    return prisma.camera.findFirst(
        {
            where: { id: parseInt(cameraId, 10) },
            include: { nodes: true }
        }
    )
}


const createCamera = async (data) => {
    return prisma.camera.create({ data: data })
}


const updateCamera = async (cameraId, newData) => {
    let dataToUpdate = newData

    delete dataToUpdate.id

    if (newData.node?.id) {
        dataToUpdate["nodeId"] = newData.node?.id
    }

    delete dataToUpdate.node

    return prisma.camera.update(
        {
            where: { id: parseInt(cameraId) },
            data: dataToUpdate
        }
    )
}


const deleteCamera = async (cameraId) => {
    return prisma.camera.delete(
        {
            where: { id: parseInt(cameraId, 10) }
        }
    )
}


module.exports = {
    getAllCameras,
    getCamera,
    createCamera,
    updateCamera,
    deleteCamera
}
