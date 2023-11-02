import Camera from '../models/Camera'
import CameraDAO from '../dao/camera'
import requestToNode from '../node_client/NodeClient'
import {validateNode} from '../dao/node_dao'
import ip from 'ip'
import dao from '../dao/camera'
import connection_dao from '../dao/connection_dao'

const validateCameraID = async (id) => {
    const cam = await dao.getCamera(id)

    if (!cam) {
        const error = Error('There is no camera with such id')
        error.status = 404
        throw error
    }

    return cam
}

const getNodeIp = async (cameraId) => {
    let { node } = await validateCameraID(cameraId)
    node = await validateNode(node)
    let nodeIp = node.ip
    // TODO Fix this, try to resolve and it resolves to localhost, then it is.
    if (['::ffff:172.18.0.1', '::ffff:172.0.0.1', '127.0.0.1', 'localhost'].includes(node.ip))
        nodeIp = ip.address()

    return nodeIp
}

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
        const nodeIp = await getNodeIp(camera.node)
        await requestToNode(nodeIp, 'add_camera', camera.toJSON())
    } catch (err) {
        console.log("Couldn't connect to node:", err)
    }
}

const edit = async (cameraId, newData) => {
    const oldCamera = getCamera(cameraId)
    const newCamera = new Camera(cameraId)
    await newCamera.setValues(newData)
    if (oldCamera.configurations.sensitivity !== newCamera.configurations.sensitivity) {
        const node = getNodeIp(newCamera.id)
        await requestToNode(node.ip, 'update_sensitivity', {camera_id: newCamera.id, sensitivity: newCamera.configurations.sensitivity})
    }
    await newCamera.save()
    return newCamera
}

const deleteCamera = async (cameraId) => {
    const camera = getCamera(cameraId)
    const nodeIp = await getNodeIp(camera.node)
    await camera.delete()
    try {
        await requestToNode(nodeIp, 'remove_camera', cameraId)
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
    const nodeIp = await getNodeIp(cameraId)
    const nodeResponse = await requestToNode(nodeIp, 'get_snapshot_url', cameraId)
    return await fetch(nodeResponse.result)
}

export {
    createNew,
    getCamera,
    edit,
    deleteCamera,
    getAll,
    isOnline,
    switchRecording,
    updateConnectionStatus,
    getSnapshot,
    validateCameraID
}
