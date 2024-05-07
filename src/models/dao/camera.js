const knex = require('./knex')
const { getConfigurations } = require('./camera_configurations_dao')
const { CAMERAS_TABLE } = require('../../constants')
const NODE = 'node'

const addConfigurationsToManyCameras = async (queryPromise) => {
    let cameras = await queryPromise
    let ids = cameras.map(camera => camera.id)
    let configs = await getConfigurations(ids)
    let configsMapped = configs.reduce(
        (accumulator, cameraConfigs) => {
            const { camera, recording, sensitivity } = cameraConfigs
            accumulator[camera] = { recording, sensitivity }
            return accumulator
        },
        {}
    )
    return cameras.map(camera => ({ ...camera, configurations: configsMapped[camera.id] }))
}

function getInNode(nodeId) {
    let query = knex(CAMERAS_TABLE).where(NODE, nodeId)
    return addConfigurationsToManyCameras(query)
}

module.exports = {
    getInNode
}