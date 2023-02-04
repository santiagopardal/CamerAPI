const knex = require('./knex')
const { CAMERA_CONFIGURATION_TABLE } = require('../constants')
const {Knex} = require('knex')

const CAMERA = 'cameraId'
const RECORDING = 'recording'
const SENSITIVITY = 'sensitivity'

const create = async (cameraId, configurations) => knex(CAMERA_CONFIGURATION_TABLE).insert({ cameraId, ...configurations })

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

const update = async (configurations) => knex(CAMERA_CONFIGURATION_TABLE).where(CAMERA, configurations.cameraId).update(configurations)

module.exports = { create, getConfigurations, update }
