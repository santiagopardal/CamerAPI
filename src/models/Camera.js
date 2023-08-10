const dao = require('../dao/camera')
const {getNodeIp} = require('../utils/cameras')
const requestToNode = require('../node_client/NodeClient')
const CameraConfigurations = require('./CameraConfigurations')

class Camera {
    constructor(id) {
        this.id = id
    }

    async setValues({ name, model, ip, streaming_port, http_port, user, password, width, height, framerate, node, configurations }) {
        this.name = name
        this.model = model
        this.ip = ip
        this.streamingPort = streaming_port
        this.httpPort = http_port
        this.user = user
        this.password = password
        this.width = width
        this.height = height
        this.framerate = framerate
        this.node = node
        if (!configurations) {
            configurations = new CameraConfigurations(this)
            await configurations.load()
        } else if (!(configurations instanceof CameraConfigurations)) {
            const configurationsJSON = configurations
            configurations = new CameraConfigurations(this)
            configurations.setValues(configurationsJSON)
        }
        this.configurations = configurations
    }

    async load() {
        const camera = await dao.getCamera(this.id)

        if (!camera) {
            const error = Error('There is no camera with such id')
            error.status = 404
            throw error
        }

        const configurations = new CameraConfigurations(this)
        await configurations.load()
        camera.configurations = configurations

        await this.setValues(camera)
    }

    async save() {
        const json = this.toJSON()
        delete json.configurations
        const promise = this.id ? dao.updateCamera(this.id, json) : dao.createCamera(json)
        const result = await promise
        this.id = this.id ? this.id : result.pop()
        await this.configurations.save()
    }

    async delete() {
        await this.configurations.delete()
        await dao.deleteCamera(this.id)
    }

    async isOnline() {
        const lastStatus = await dao.getLastStatus(this.id)
        return lastStatus.length > 0 && lastStatus.pop().message === 'Connected'
    }

    async switchRecording(record) {
        const nodeIp = await getNodeIp(this.id)
        const method = record ? 'record' : 'stop_recording'
        const args = [this.id]
        const nodeResponse = await requestToNode(nodeIp, method, args)
        return nodeResponse.result[this.id]
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            model: this.model,
            ip: this.ip,
            streaming_port: this.streamingPort,
            http_port: this.httpPort,
            user: this.user,
            password: this.password,
            width: this.width,
            height: this.height,
            framerate: this.framerate,
            node: this.node,
            configurations: this.configurations.toJSON()
        }
    }
}

module.exports = Camera
