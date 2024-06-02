const Node = require('../models/Node')
const CameraDAO = require('../dao/CameraDAO')
const ConnectionDAO = require('../dao/ConnectionDAO')
const {NodeType} = require("@prisma/client");

const createNew = async (data) => {
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

    if (newData.sensitivity != null && oldCamera.sensitivity !== newData.sensitivity) {
        const nodeData = camera.nodes.find(node => node.type === NodeType["OBSERVER"])
        const node = new Node(nodeData.id)
        node.setValues(nodeData)
        await node.updateSensitivity(camera.id, newData.sensitivity)
    }

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
    const promises = [
        CameraDAO.getCamera(cameraId),
        CameraDAO.updateCamera(cameraId, { recording: newStatus })
    ]
    const [camera, _] = await Promise.all(promises)

    const nodeData = camera.nodes.find(node => node.type === NodeType["OBSERVER"])
    const node = new Node(nodeData.id)
    node.setValues(nodeData)

    if (!newStatus) {
        await node.stopRecording(parseInt(cameraId, 10))
    } else {
        await node.startRecording(parseInt(cameraId, 10))
    }
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
