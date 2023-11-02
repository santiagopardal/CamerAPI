const node_dao = require('../dao/node_dao')

const updateNodeLastRequest = async (nodeId, lastRequest) => {
    await node_dao.validateNode(nodeId)
    const date = new Date()
    await node_dao.update({
        id: nodeId,
        last_request: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}@${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    })
}

export {
    updateNodeLastRequest
}
