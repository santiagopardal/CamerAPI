const knex = require('./knex')
const { CAMERA_CONFIGURATION_TABLE } = require('../constants')

const CAMERA = 'cameraId'
const RECORDING = 'recording'
const SENSITIVITY = 'sensitivity'

const getConfigurations = async (cameraIds) => {
    let orCondition = cameraIds.map(
        (cameraId) => `${CAMERA} = ${cameraId}`
    )
    return knex(CAMERA_CONFIGURATION_TABLE)
        .select(CAMERA)
        .select(RECORDING)
        .select(SENSITIVITY)
        .whereRaw(orCondition.join(' OR '))
}

module.exports = { getConfigurations }
