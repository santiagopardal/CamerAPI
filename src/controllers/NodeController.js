const dao = require('../models/dao/node_dao')
const Node = require('../models/Node')

const node_dao = require('../models/dao/node_dao')

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

const updateNodeLastRequest = async (nodeId, date) => {
    const node = new Node(nodeId)
    await node.load()
    await node_dao.update({
        id: nodeId,
        last_request: date
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
