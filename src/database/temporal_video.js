const knex = require('./knex')
const { TEMPORAL_VIDEOS_TABLE } = require('../constants')

const CAMERA = 'camera'
const PATH = 'path'
const DATE = 'date'

function logVideo(video) {
    return knex(TEMPORAL_VIDEOS_TABLE).insert(video)
}

function getAllVideos(camera) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(CAMERA, camera)
        .select(PATH)
        .select(DATE)
}

function getAllVideosInDate(camera, date) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(`${TEMPORAL_VIDEOS_TABLE}.${DATE}`, date)
        .select(PATH)
}

function deleteAllVideosInDate(camera, date) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(`${TEMPORAL_VIDEOS_TABLE}.${DATE}`, date)
        .del()
}

module.exports = {
    logVideo,
    getAllVideos,
    getAllVideosInDate,
    deleteAllVideosInDate
}