const NodeDao = require('./dao/node_dao')
const CameraDAO = require('./dao/camera')
const ip = require('ip')
const requestToNode = require('../node_client/NodeClient')

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
        return await CameraDAO.getInNode(this.id)
    }

    getIp() {
        let nodeIp = this.ip
        // TODO Fix this, try to resolve and it resolves to localhost, then it is.
        if (['::ffff:172.18.0.1', '::ffff:172.0.0.1', '127.0.0.1', 'localhost'].includes(nodeIp))
            nodeIp = ip.address()

        return nodeIp
    }

    async request(method, args) {
        return await requestToNode(this.getIp(), method, args)
    }

    toJSON() {
        return {
            ip: this.ip,
            port: this.port
        }
    }
}

module.exports = Node
