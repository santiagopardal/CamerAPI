const knex = require('./knex')
const { NODES_TABLE } = require('../constants')

const ID = 'id'
const IP = 'ip'
const PORT = 'port'
const LAST_REQUEST = 'last_request'

async function validateNode(id) {
    const node = await getNode(id)

    if (!node) {
        const error = Error('There is no node with such id')
        error.status = 404

        throw error
    }

    return node
}

function getNodes() {
    return knex(NODES_TABLE)
        .select(ID)
        .select(IP)
        .select(PORT)
}

async function getNode(id) {
    return (await knex(NODES_TABLE)
        .select(ID)
        .select(IP)
        .select(PORT)
        .where(ID, id))[0]
}

function deleteNode(id) {
    return knex(NODES_TABLE)
        .where(ID, id)
        .delete()
}

function saveNode(node) {
    return knex(NODES_TABLE).insert(node)
}

function update(node) {
    return knex(NODES_TABLE)
        .where(ID, node.id)
        .update(node)
}

module.exports = {
    validateNode,
    getNodes,
    deleteNode,
    saveNode,
    update
}
