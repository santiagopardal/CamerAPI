const knex = require('./knex')
const { CAMERAS_TABLE } = require('../constants')

const ID = 'id'
const NODE = 'node'

function createCamera(camera) {
    return knex(CAMERAS_TABLE).insert(camera)
}

const getAllCameras = () => knex(CAMERAS_TABLE).select('*')

const getInNode = (nodeId) => knex(CAMERAS_TABLE).where(NODE, nodeId)

async function getCamera(id) {
    const camera = await knex(CAMERAS_TABLE).where(ID, id).select('*').limit(1)
    return camera ? camera[0] : null
}

function deleteCamera(cameraId) {
    return knex(CAMERAS_TABLE).where(ID, cameraId).delete()
}

async function updateCamera(cameraId, camera) {
    return knex(CAMERAS_TABLE).where(ID, cameraId).where('name', camera.name).update(camera)
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