const knex = require('./knex')
const { CAMERAS_TABLE } = require('../constants')

const ID = 'id'

function createCamera(camera) {
    return knex(CAMERAS_TABLE).insert(camera)
}

function getAllCameras() {
    return knex(CAMERAS_TABLE).select('*')
}

async function getCamera(id) {
    return (await knex(CAMERAS_TABLE).where(ID, id).select('*'))[0]
}

function deleteCamera(cameraId) {
    return knex(CAMERAS_TABLE).where(ID, cameraId).del()
}

function updateCamera(cameraId, camera) {
    return knex(CAMERAS_TABLE).where(ID, cameraId).update(camera)
}

module.exports = {
    createCamera,
    getAllCameras,
    getCamera,
    deleteCamera,
    updateCamera
}