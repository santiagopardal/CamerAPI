const dao = require('../models/dao/node_dao')
const Node = require('../models/Node')

const node_dao = require('../models/dao/node_dao')

const createNode = async (nodeData) => {
    const date = new Date()
    nodeData.last_request = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}@${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    await dao.saveNode(nodeData)
    delete nodeData.last_request
    return await dao.getNode(nodeData)
}

const nodeExists = async (nodeData) => {
    const node = await dao.getNode(nodeData)
    return node != null
}

const deleteNode = async (nodeId) => {
    const node = new Node(nodeId)
    await node.delete()
}

const getNode = async (nodeId) => {
    const node = new Node(nodeId)
    await node.load()
    return node
}

const getAll = async () => {
    return await dao.getNodes()
}

const updateNodeLastRequest = async (nodeId, lastRequest) => {
    const node = new Node(nodeId)
    await node.load()
    const date = new Date()
    await node_dao.update({
        id: nodeId,
        last_request: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}@${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    })
}

const getNodeCameras = async (nodeId) => {
    const node = new Node(nodeId)
    await node.load()
    return await node.getCameras()
}

module.exports = {
    createNode,
    getNode,
    getAll,
    updateNodeLastRequest,
    getNodeCameras,
    deleteNode,
    nodeExists
}
