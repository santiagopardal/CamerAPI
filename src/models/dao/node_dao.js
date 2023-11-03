const knex = require('./knex')
const { NODES_TABLE } = require('../../constants')

const ID = 'id'
const IP = 'ip'
const PORT = 'port'
const LAST_REQUEST = 'last_request'

async function validateNode(id) {
    const node = await getNode({id: id})

    if (!node) {
        const error = Error('There is no node with such id')
        error.status = 404

        throw error
    }

    return node
}

function getNodes() {
    return knex(NODES_TABLE).select(ID).select(IP).select(PORT)
}

async function getNode(node) {
    let query = knex(NODES_TABLE).select(ID).select(IP).select(PORT)
    Object.keys(node).forEach(key => query.where(key, node[key]))
    const nodeFetched = await query
    return nodeFetched ? nodeFetched[0] : null
}

function deleteNode(id) {
    return knex(NODES_TABLE).where(ID, id).delete()
}

function saveNode(node) {
    return knex(NODES_TABLE).insert(node)
}

function update(node) {
    return knex(NODES_TABLE).where(ID, node.id).update(node)
}

module.exports = {
    validateNode,
    getNodes,
    getNode,
    deleteNode,
    saveNode,
    update
}
