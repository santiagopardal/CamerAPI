const Camera = require('../models/Camera')
const CameraDAO = require('../models/dao/camera')
const connection_dao = require('../models/dao/connection_dao')
const Node = require('../models/Node')

const getCamerasFromJSON = async (camerasAsJSON) => {
    const promises = []
    const cameras = camerasAsJSON.map(
        camera => {
            const cam = new Camera(camera.id)
            promises.push(cam.setValues(camera))
            return cam
        }
    )
    await Promise.all(promises)
    return cameras
}

const createNew = async (data) => {
    const camera = new Camera()
    await camera.setValues(data)
    await camera.save()
    try {
        const node = await camera.getNode()
        await node.request('add_camera', camera.toJSON())
    } catch (err) {
        console.log("Couldn't connect to node:", err)
    }
}

const edit = async (cameraId, newData) => {
    const oldCamera = await getCamera(cameraId)
    const newCamera = new Camera(cameraId)
    await newCamera.setValues(newData)
    if (oldCamera.configurations.sensitivity !== newCamera.configurations.sensitivity) {
        const node = await newCamera.getNode()
        await node.request('update_sensitivity', {camera_id: newCamera.id, sensitivity: newCamera.configurations.sensitivity})
    }
    await newCamera.save()
    return newCamera
}

const deleteCamera = async (cameraId) => {
    const camera = await getCamera(cameraId)
    const node = await camera.getNode()
    await camera.delete()
    try {
        await node.request('remove_camera', cameraId)
    } catch (err) {
        console.log("Couldn't connect to node:", err)
    }
}

const getCamera = async (cameraId) => {
    const camera = new Camera(cameraId)
    await camera.load()
    return camera
}

const getAll = async () => {
    const camerasAsJSON = await CameraDAO.getAllCameras()
    return await getCamerasFromJSON(camerasAsJSON)
}

const isOnline = async (cameraId) => {
    const camera = await getCamera(cameraId)
    return await camera.isOnline()
}

const switchRecording = async (cameraId, newStatus) => {
    const camera = await getCamera(cameraId)
    return await camera.switchRecording(newStatus)
}

const updateConnectionStatus = async (cameraId, message, date) => {
    await getCamera(cameraId)
    let status = {
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
    const camera = new Camera(cameraId)
    await camera.load()
    return await camera.getSnapshot()
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
