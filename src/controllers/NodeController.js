const dao = require('../models/dao/node_dao')
const Node = require('../models/Node')

const createNode = async (nodeData) => {
    nodeData.last_request = new Date()
    await dao.saveNode(nodeData)
    delete nodeData.last_request
    return await dao.getNode(nodeData)
}

const nodeExists = async (nodeData) => {
    const node = await dao.getNode(nodeData)
    return node != null
}

const update = async (node) => {
    await node.update()
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

const getNodeCameras = async (nodeId) => {
    const node = new Node(nodeId)
    await node.load()
    return await node.getCameras()
}

module.exports = {
    createNode,
    getNode,
    getAll,
    getNodeCameras,
    deleteNode,
    nodeExists,
    update
}
