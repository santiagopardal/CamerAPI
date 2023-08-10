const Camera = require('../models/Camera')
const CameraDAO = require('../dao/camera')
const {getCamerasFromJSON} = require('../utils/cameras')

class CameraController {
    async get(id) {
        const camera = new Camera(id)
        await camera.load()
        return camera
    }

    async getAll() {
        let camerasAsJSON = await CameraDAO.getAllCameras()
        return await getCamerasFromJSON(camerasAsJSON)
    }
}

module.exports = CameraController
