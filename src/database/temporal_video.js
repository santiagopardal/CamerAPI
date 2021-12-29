const knex = require('./knex')
const { TEMPORAL_VIDEOS_TABLE } = require('../constants')

const CAMERA = 'camera'
const PATH = 'path'
const DATE = 'date'

function logVideo(video) {
    return knex(TEMPORAL_VIDEOS_TABLE).insert(video)
}

function markVideoAsLocallyStored(old_path, new_path) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where('path', old_path)
        .update({ 'path': new_path, 'locally_stored': true })
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
    markVideoAsLocallyStored,
    getAllVideos,
    getAllVideosInDate,
    deleteAllVideosInDate
}