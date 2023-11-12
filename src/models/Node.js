const NodeDao = require('./dao/node_dao')
const CameraDAO = require('./dao/camera')
const net = require('net')
const requestToNode = require('./NodeClient/NodeClient')
const NODE_PROTO_PATH = `${__dirname}/protos/Node.proto`
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
const GRPCNode = grpc.loadPackageDefinition(packageDefinition).Node

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
        const ipProtocol = net.isIPv6(this.ip) ? 'ipv6' : 'ipv4'
        const client = new GRPCNode(`${ipProtocol}:[${this.ip}]:50051`, grpc.credentials.createInsecure())
        const requestData = { camera_id: cameraId }
        const fetchUrl = (resolve, reject) => {
            client.get_snapshot_url(
                requestData,
                (error, response) => {
                    if (error) reject(error)
                    else resolve(response.url)
                }
            )
        }
        return new Promise(fetchUrl)
    }

    async request(method, args) {
        return await requestToNode(this.ip, method, args)
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
