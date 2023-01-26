const knex = require('./knex')
const { CAMERAS_TABLE } = require('../constants')

const ID = 'id'
const NODE = 'node'

function createCamera(camera) {
    return knex(CAMERAS_TABLE).insert(camera)
}

function getAllCameras() {
    return knex(CAMERAS_TABLE).select('*')
}

function getInNode(nodeId) {
    return knex(CAMERAS_TABLE).where(NODE, nodeId)
}

async function getCamera(id) {
    const camera = await knex(CAMERAS_TABLE).where(ID, id).select('*')
    return camera ? camera[0] : null
}

function deleteCamera(cameraId) {
    return knex(CAMERAS_TABLE).where(ID, cameraId).delete()
}

function updateCamera(cameraId, camera) {
    return knex(CAMERAS_TABLE).where(ID, cameraId).update(camera)
}

function getLastStatus(cameraId) {
    return knex('connection')
        .select('message')
        .where('camera', cameraId)
        .orderBy('id', 'DESC')
        .limit(1)
}

module.exports = {
    createCamera,
    getAllCameras,
    getInNode,
    getCamera,
    deleteCamera,
    updateCamera,
    getLastStatus
}