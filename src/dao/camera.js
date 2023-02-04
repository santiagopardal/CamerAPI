const knex = require('./knex')
const { getConfigurations, update } = require('./camera_configurations_dao')
const { CAMERAS_TABLE } = require('../constants')

const ID = 'id'
const NODE = 'node'

const addConfigurationsToCamera = async (cameraId, queryPromise) => {
    const configsArray = await getConfigurations([cameraId])
    let configs = {}
    if (configsArray.length > 0) {
        configs = configsArray[0]
        const camera = await queryPromise
        return {...camera, configurations: { recording: !!configs.recording, sensitivity: configs.sensitivity }}
    }
    return null
}

const addConfigurationsToManyCameras = async (queryPromise) => {
    let cameras = await queryPromise
    let ids = cameras.map(camera => camera.id)
    let configs = await getConfigurations(ids)
    let configsMapped = configs.reduce(
        (accumulator, cameraConfigs) => {
            const { cameraId, recording, sensitivity } = cameraConfigs
            accumulator[cameraId] = { recording, sensitivity }
            return accumulator
        },
        {}
    )
    return cameras.map(camera => ({ ...camera, configurations: configsMapped[camera.id] }))
}

function createCamera(camera) {
    return knex(CAMERAS_TABLE).insert(camera)
}

function getAllCameras() {
    let query = knex(CAMERAS_TABLE).select('*')
    return addConfigurationsToManyCameras(query)
}

function getInNode(nodeId) {
    let query = knex(CAMERAS_TABLE).where(NODE, nodeId)
    return addConfigurationsToManyCameras(query)
}

async function getCamera(id) {
    const camera = await knex(CAMERAS_TABLE).where(ID, id).select('*').limit(1)
    return camera ? addConfigurationsToCamera(id, camera[0]) : null
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