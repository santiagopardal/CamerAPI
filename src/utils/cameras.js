const {validateNode} = require('../dao/node_dao')
const ip = require('ip')
const dao = require('../dao/camera')
const Camera = require('../models/Camera')

const validateCameraID = async(id) => {
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
    for (const promise of promises) {
        await promise
    }
    return cameras
}

module.exports = {
    validateCameraID,
    getNodeIp,
    getCamerasFromJSON
}
