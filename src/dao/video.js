const knex = require('./knex')
const { CAMERAS_TABLE, VIDEOS_TABLE } = require('../constants')

const CAMERA = 'camera'
const PATH = 'path'
const DATE = 'date'
const ID = 'id'
const NAME = 'name'
const IS_TEMPORAL = 'is_temporal'
const LOCALLY_STORED = 'locally_stored'

function logVideo(video) {
    return knex(VIDEOS_TABLE).insert(video)
}

function getAllFinalVideos(cameraId) {
    return knex(VIDEOS_TABLE)
        .where(`${CAMERA}`, cameraId)
        .where(IS_TEMPORAL, 0)
        .select(`${ID}`)
        .select(PATH)
        .select(DATE)
}

async function getFinalVideoPath(camera, date) {
    return (await knex(VIDEOS_TABLE)
        .where(`${CAMERA}`, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .where(IS_TEMPORAL, 0)
        .select(PATH))[0]
}

function markVideoAsLocallyStored(old_path, new_path) {
    return knex(VIDEOS_TABLE)
        .where('path', old_path)
        .update({ 'path': new_path, 'node': 1 })
}

async function getVideo(id) {
    return knex(VIDEOS_TABLE)
        .where(ID, id)
        .select(ID)
        .select(PATH)
        .select(DATE)
        .select(CAMERA)
        .select(LOCALLY_STORED)
}

function getAllTemporalVideos(camera) {
    return knex(VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(IS_TEMPORAL, 1)
        .select(ID)
        .select(PATH)
        .select(DATE)
        .select(LOCALLY_STORED)
        .orderBy(PATH, 'asc')
}

function getAllTemporalVideosInDate(camera, date) {
    return knex(VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .where(IS_TEMPORAL, 1)
        .select(ID)
        .select(PATH)
        .select(LOCALLY_STORED)
        .orderBy(PATH, 'asc')
}

function deleteVideo(id) {
    return knex(VIDEOS_TABLE)
        .where(ID, id)
        .del()
}

function deleteAllTemporalVideosInDate(camera, date) {
    return knex(VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .where(IS_TEMPORAL, 1)
        .del()
}

module.exports = {
    logVideo,
    getAllFinalVideos,
    getFinalVideoPath,
    markVideoAsLocallyStored,
    getVideo,
    getAllTemporalVideos,
    getAllTemporalVideosInDate,
    deleteVideo,
    deleteAllTemporalVideosInDate
}