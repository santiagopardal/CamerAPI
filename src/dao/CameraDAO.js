const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


const getAllCameras = async () => {
    return prisma.camera.findMany(
        {
            include: { nodes: true }
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
    const nodes = data.nodes.map(
        node => ({ id: node.id })
    )
    delete data.nodes
    console.log(data)
    return prisma.camera.create(
        {
            data: {
                ...data,
                nodes: {
                    connect: nodes
                }
            },
            include: { nodes: true }
        }
    )
}


const updateCamera = async (cameraId, newData) => {
    let dataToUpdate = newData

    delete dataToUpdate.id
    const newNodes = newData.nodes.map(
        node => ({ id: node.id })
    )

    return prisma.camera.update(
        {
            where: { id: parseInt(cameraId) },
            data: {
                ...dataToUpdate,
                nodes: {
                    set: newNodes
                }
            },
            include: { nodes: true }
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
