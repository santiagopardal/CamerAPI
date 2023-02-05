const Camera = require('../models/Camera')
const CameraDAO = require('../dao/camera')

class CameraController {
    async get(id) {
        const camera = new Camera(id)
        await camera.load()
        return camera
    }

    async getAll() {
        let camerasAsJSON = await CameraDAO.getAllCameras()
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
}

module.exports = CameraController
