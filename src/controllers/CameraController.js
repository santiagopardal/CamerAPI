const Node = require('../models/Node')
const CameraDAO = require('../dao/CameraDAO')
const ConnectionDAO = require('../dao/ConnectionDAO')
const {NodeType} = require("@prisma/client");

const createNew = async (data) => {
    console.log("DAta on controller:", data)
    const camera = await CameraDAO.createCamera(data)
    try {
        const nodeData = camera.nodes.find(node => node.type === NodeType["OBSERVER"])
        const node = new Node(nodeData.id)
        node.setValues(nodeData)
        await node.addCamera(camera)
    } catch (err) {
        console.log("Couldn't connect to node:", err)
    }
    return camera
}

const edit = async (cameraId, newData) => {
    const oldCamera = await CameraDAO.getCamera(cameraId)

    const camera = await CameraDAO.updateCamera(cameraId, newData)

    const nodePool = new Map()
    let promises = []

    for (let nodeInfo in oldCamera.nodes) {
        if (!camera.nodes.includes(nodeInfo.id)) {
            const node = new Node(nodeInfo.id)
            node.setValues(nodeInfo)
            promises.push(node.removeCamera(cameraId))
            nodePool.set(node.id, node)
        }
    }

    for (let nodeInfo in camera.nodes) {
        if (!oldCamera.nodes.includes(nodeInfo.id)) {
            const node = new Node(nodeInfo.id)
            node.setValues(nodeInfo)
            promises.push(node.addCamera(camera))
            nodePool.set(node.id, node)
        }
    }

    await Promise.allSettled(promises)
    promises = []

    if (newData.sensitivity != null && oldCamera.sensitivity !== newData.sensitivity) {
        camera.nodes.filter(node => node.type === NodeType["OBSERVER"]).forEach(
            (nodeInfo) => {
                let node;
                if (nodePool.has(nodeInfo.id)) {
                    node = nodePool.get(nodeInfo.id)
                } else {
                    node = new Node(nodeInfo.id)
                    node.setValues(nodeInfo)
                }

                promises.push(node.updateSensitivity(camera.id, newData.sensitivity))
            }
        )
    }

    await Promise.allSettled(promises)

    return camera
}

const deleteCamera = async (cameraId) => {
    const camera = await CameraDAO.deleteCamera(cameraId)
    const nodeData = camera.nodes.find(node => node.type === NodeType["OBSERVER"])
    const node = new Node(nodeData.id)
    node.setValues(nodeData)
    try {
        await node.removeCamera(parseInt(cameraId, 10))
    } catch (err) {
        console.log("Couldn't connect to node or DB error:", err)
    }
}

const getCamera = async (cameraId) => {
    return CameraDAO.getCamera(cameraId)
}

const getAll = async () => {
    return CameraDAO.getAllCameras()
}

const isOnline = async (cameraId) => {
    const lastStatus = await ConnectionDAO.getLastConnection(cameraId)
    return lastStatus != null && lastStatus.message === "Connected"
}

const switchRecording = async (cameraId, newStatus) => {
    const camera = await CameraDAO.getCamera(cameraId)
    camera.recording = newStatus
    await CameraDAO.updateCamera(cameraId, camera)

    const nodeData = camera.nodes.find(node => node.type === NodeType["OBSERVER"])
    const node = new Node(nodeData.id)
    node.setValues(nodeData)

    const promises = []

    for (let nodeInfo in camera.nodes) {
        const node = new Node(nodeInfo.id)
        node.setValues(nodeInfo)

        if (!newStatus) {
            promises.push(node.stopRecording(parseInt(cameraId, 10)))
        } else {
            promises.push(node.startRecording(parseInt(cameraId, 10)))
        }
        promises.push(node.addCamera(camera))
    }

    await Promise.allSettled(promises)
}

const updateConnectionStatus = async (cameraId, message, date) => {
    if (!message || !date) {
        const error = Error('Connection message or date missing.')
        error.status = 400
        throw error
    }

    await ConnectionDAO.createConnection(cameraId, message, date)
}

const getSnapshot = async (cameraId) => {
    const camera = await CameraDAO.getCamera(cameraId)
    const nodeData = camera.nodes.find(node => node.type === NodeType["OBSERVER"])
    const node = new Node(nodeData.id)
    node.setValues(nodeData)
    return await node.getSnapshot(cameraId)
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
