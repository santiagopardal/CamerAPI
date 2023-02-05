const Camera = require('../models/Camera')
const CameraDAO = require('../dao/camera')

class CameraController {
    async get(id) {
        const camera = new Camera(id)
        await camera.load()
        return camera
    }

    async getAll() {
        let cameras = await CameraDAO.getAllCameras()
        cameras = cameras.map(camera => new Camera(camera.id))
        const promises = []
        cameras.forEach(camera => promises.push(camera.load()))
        for (const promise of promises) {
            await promise
        }
        return cameras
    }
}

module.exports = CameraController
