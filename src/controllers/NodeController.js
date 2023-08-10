const NodeDAO = require('../dao/node_dao')
const Node = require('../models/Node')

class NodeController {

    async get(id) {
        const node = new Node(id)
        await node.load()
        return node
    }

    async getAll() {
        const nodesAsJSON = NodeDAO.getNodes()
        return nodesAsJSON.map(
            node => {
                const newNode = new Node(node.id)
                newNode.setValues(node)
                return newNode
            }
        )
    }
}

module.exports = NodeController
