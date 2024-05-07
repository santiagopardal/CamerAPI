const Node = require('../models/Node')
const connection_dao = require('../models/dao/connection_dao')
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient()

const createNew = async (data) => {
    const camera = await prisma.camera.create(
        {
            data: { ...data }
        }
    )
    try {
        const node = new Node(camera.nodeId)
        await node.load()
        await node.addCamera(camera)
    } catch (err) {
        console.log("Couldn't connect to node:", err)
    }
    return camera
}

const edit = async (cameraId, newData) => {
    const oldConfigurations = prisma.cameraConfigurations.findFirst(
        {
            where: { cameraId: parseInt(cameraId) },
            select: { sensitivity: true }
        }
    )
    const newConfigurations = newData.configurations

    delete newData.configurations

    const camera = await prisma.camera.update(
        {
            where: { id: parseInt(cameraId) },
            data: newData
        }
    )

    if (newConfigurations != null && oldConfigurations.sensitivity !== newConfigurations.sensitivity) {
        const promises = []
        promises.push(
            prisma.cameraConfigurations.update(
                {
                    where: { cameraId: parseInt(cameraId) },
                    data: newConfigurations
                }
            )
        )
        const node = new Node(camera.nodeId)
        await node.load()
        promises.push(
            node.updateSensitivity(camera.id, newConfigurations.sensitivity)
        )
        await Promise.all(promises)
    }

    return camera
}

const deleteCamera = async (cameraId) => {
    await prisma.cameraConfigurations.deleteMany(
        {
            where: { cameraId: parseInt(cameraId, 10) }
        }
    )
    const camera = await prisma.camera.delete(
        {
            where: {id: parseInt(cameraId, 10)}
        }
    )
    const node = new Node(camera.nodeId)
    await node.load()
    try {
        await node.removeCamera(parseInt(cameraId, 10))
    } catch (err) {
        console.log("Couldn't connect to node or DB error:", err)
    }
}

const getCamera = async (cameraId) => {
    return prisma.camera.findFirst(
        {
            where: { id: parseInt(cameraId, 10) },
            include: { node: true, configurations: true }
        }
    )
}

const getAll = async () => {
    return prisma.camera.findMany(
        {
            include: {
                node: true,
                configurations: true,
            }
        }
    )
}

const isOnline = async (cameraId) => {
    const lastStatus = await prisma.connection.findFirst(
        {
            where: { cameraId: parseInt(cameraId, 10) },
            orderBy: { date: "desc" }
        }
    )

    return lastStatus != null && lastStatus.message === "Connected"
}

const switchRecording = async (cameraId, newStatus) => {
    const camera = await getCamera(cameraId)
    return await camera.switchRecording(newStatus)
}

const updateConnectionStatus = async (cameraId, message, date) => {
    await getCamera(cameraId)
    const status = {
        camera: cameraId,
        message: message,
        date: date
    }

    if (!status.message || ! status.date) {
        const error = Error('Connection message or date missing.')
        error.status = 400
        throw error
    }

    await connection_dao.logStatus(status)
}

const getSnapshot = async (cameraId) => {
    const queryData = await prisma.camera.findFirst(
        {
            where: {
                id: parseInt(cameraId, 10)
            },
            select: { nodeId: true }
        }
    )

    const node = new Node(queryData.nodeId)
    await node.load()

    const url = await node.getSnapshotURL(this.id)
    return await fetch(url)
}

module.exports = {
    createNew,
    getCamera,
    edit,
    deleteCamera,
    getAll,
    isOnline,
    switchRecording,
    updateConnectionStatus,
    getSnapshot
}
