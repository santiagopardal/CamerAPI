const NodeDao = require('../dao/node_dao')
const CameraDAO = require('../dao/camera')
const {getCamerasFromJSON} = require('../utils/cameras')

class Node {

    constructor(id) {
        this.id = id
    }

    setValues({ ip, port, last_request }) {
        this.ip = ip
        this.port = port
        this.lastRequest = last_request
    }

    async load() {
        const nodeJSON = await NodeDao.getNode({id: this.id})
        if (!nodeJSON) {
            const error = Error('There is no node with such id')
            error.status = 404
            throw error
        }
        this.setValues(nodeJSON)
    }

    async save() {
        await NodeDao.saveNode(this.toJSON())
    }

    async delete() {
        await NodeDao.deleteNode(this.id)
    }

    async getCameras() {
        const camerasJSON = await CameraDAO.getInNode(this.id)
        return await getCamerasFromJSON(camerasJSON)
    }

    toJSON() {
        return {
            ip: this.ip,
            port: this.port
        }
    }
}

module.exports = Node
