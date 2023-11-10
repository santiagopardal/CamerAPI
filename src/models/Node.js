const NodeDao = require('./dao/node_dao')
const CameraDAO = require('./dao/camera')
const ip = require('ip')
const requestToNode = require('./NodeClient/NodeClient')
const NODE_PROTO_PATH = `${__dirname}/../protos/Node.proto`
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
        this.client = new Node.Node(`${this.getIp()}`, grpc.credentials.createInsecure())
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

    async getSnapshotURL() {
        const fetchUrl = (resolve, reject) => {
            this.client.get_snapshot_url(
                this.id,
                (error, url) => {
                    console.log(error, url)
                    if (error) reject(error)
                    else resolve(url)
                }
            )
        }
        return new Promise(fetchUrl)
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
