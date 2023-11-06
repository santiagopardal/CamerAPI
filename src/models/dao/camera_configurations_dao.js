const knex = require('./knex')
const { CAMERA_CONFIGURATION_TABLE } = require('../../constants')
const {Knex} = require('knex')

const CAMERA = 'camera'
const RECORDING = 'recording'
const SENSITIVITY = 'sensitivity'

const create = async (camera, configurations) => knex(CAMERA_CONFIGURATION_TABLE).insert({ camera, ...configurations })

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

const update = async (configurations) => knex(CAMERA_CONFIGURATION_TABLE).where(CAMERA, configurations.camera).update(configurations)
const deleteConfigurations = async (camera) => knex(CAMERA_CONFIGURATION_TABLE).delete().where(CAMERA, camera)

module.exports = { create, getConfigurations, update, deleteConfigurations }
