const NodeDao = require('./dao/node_dao')
const CameraDAO = require('./dao/camera')
const net = require('net')
const requestToNode = require('./NodeClient/NodeClient')
const NODE_PROTO_PATH = `${__dirname}/CamerAIProtos/Node.proto`
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
    NODE_PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
)
const GRPCNode = grpc.loadPackageDefinition(packageDefinition).node.Node

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
        if (!this.id) {
            await NodeDao.saveNode(this.toJSON())
        } else {
            await this.update()
        }
    }

    async update() {
        await NodeDao.update(this.toJSON())
    }

    async delete() {
        await NodeDao.deleteNode(this.id)
    }

    async getCameras() {
        return await CameraDAO.getInNode(this.id)
    }

    async getSnapshotURL(cameraId) {
        const client = this.getGRCPClient()
        const requestData = { camera_id: cameraId }
        const fetchUrl = (resolve, reject) => {
            client.get_snapshot_url(
                requestData,
                (error, response) => {
                    if (error) reject(error)
                    else resolve(response.value)
                }
            )
        }
        return new Promise(fetchUrl)
    }

    async updateSensitivity(cameraId, sensitivity) {
        const client = this.getGRCPClient()
        const requestSensitivityUpdate = (resolve, reject) => {
            client.update_sensitivity(
                { camera_id: cameraId, sensitivity: sensitivity },
                (error, _) => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        }
        return new Promise(requestSensitivityUpdate)
    }

    async startRecording(cameraId) {
        const client = this.getGRCPClient()
        const requestCameraToStartRecording = (resolve, reject) => {
            client.record(
                { cameras_ids: [cameraId] },
                (error, _) => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        }
        return new Promise(requestCameraToStartRecording)
    }

    async stopRecording(cameraId) {
        const client = this.getGRCPClient()
        const requestCameraToStopRecording = (resolve, reject) => {
            client.stop_recording(
                { cameras_ids: [cameraId] },
                (error, _) => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        }
        return new Promise(requestCameraToStopRecording)
    }

    async stop() {
        const client = this.getGRCPClient()
        const requestNodeToStop = (resolve, reject) => {
            client.stop(
                null,
                (error, _) => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        }
        return new Promise(requestNodeToStop)
    }

    async addCamera(camera) {
        const cameraData = camera.toJSON()
        delete cameraData.node
        const client = this.getGRCPClient()
        const addCameraCallback = (resolve, reject) => {
            client.add_camera(
                cameraData,
                (error, _) => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        }
        return new Promise(addCameraCallback)
    }

    async removeCamera(cameraId) {
        const client = this.getGRCPClient()
        const removeCameraCallback = (resolve, reject) => {
            client.remove_camera(
                { camera_id: cameraId },
                (error, _) => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        }
        return new Promise(removeCameraCallback)
    }

    async request(method, args) {
        return await requestToNode(this.ip, method, args)
    }

    getGRCPClient() {
        if (!this.client) {
            const ipProtocol = net.isIPv6(this.ip) ? 'ipv6' : 'ipv4'
            this.client = new GRPCNode(`${ipProtocol}:[${this.ip}]:50051`, grpc.credentials.createInsecure())
        }
        return this.client
    }

    toJSON() {
        const result = { ip: this.ip, port: this.port, last_request: this.lastRequest }
        if (this.id) {
            result.id = this.id
        }
        return result
    }
}

module.exports = Node
