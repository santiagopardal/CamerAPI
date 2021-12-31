const knex = require('./knex')
const { TEMPORAL_VIDEOS_TABLE } = require('../constants')

const CAMERA = 'camera'
const ID = 'id'
const PATH = 'path'
const DATE = 'date'
const LOCALLY_STORED = 'locally_stored'

function logVideo(video) {
    return knex(TEMPORAL_VIDEOS_TABLE).insert(video)
}

function markVideoAsLocallyStored(old_path, new_path) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where('path', old_path)
        .update({ 'path': new_path, 'locally_stored': true })
}

async function getVideo(id) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(ID, id)
        .select(ID)
        .select(PATH)
        .select(DATE)
        .select(CAMERA)
        .select(LOCALLY_STORED)
}

function getAllVideos(camera) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(CAMERA, camera)
        .select(ID)
        .select(PATH)
        .select(DATE)
        .select(LOCALLY_STORED)
        .orderBy(PATH, 'asc')
}

function getAllVideosInDate(camera, date) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(`${TEMPORAL_VIDEOS_TABLE}.${DATE}`, date)
        .select(ID)
        .select(PATH)
        .select(LOCALLY_STORED)
        .orderBy(PATH, 'asc')
}

function deleteVideo(id) {
    return knex(TEMPORAL_VIDEOS_TABLE)
        .where(ID, id)
        .del()
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
    getVideo,
    getAllVideos,
    getAllVideosInDate,
    deleteVideo,
    deleteAllVideosInDate
}