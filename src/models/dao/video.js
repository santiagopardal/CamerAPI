const knex = require('./knex')
const moment = require('moment')
const { VIDEOS_TABLE } = require('../../constants')

const CAMERA = 'camera'
const PATH = 'path'
const DATE = 'date'
const ID = 'id'
const IS_TEMPORAL = 'is_temporal'
const NODE = 'node'
const IS_IN_NODE = 'is_in_node'

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
        .select(NODE)
        .select(IS_IN_NODE)
}

async function getFinalVideosBetweenDates(cameraId, startingDate, endingDate) {
    const videos = await getAllFinalVideos(cameraId)
    return videos.filter(video => startingDate <= moment(video.date, 'DD-MM-YYYY') && moment(video.date, 'DD-MM-YYYY') <= endingDate)
}

async function getFinalVideoPath(camera, date) {
    const videos = await knex(VIDEOS_TABLE)
        .where(`${CAMERA}`, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .where(IS_TEMPORAL, 0)
        .select(PATH)
    return videos ? videos[0].path : null
}

async function getFinalVideoId(camera, date) {
    const videos = await knex(VIDEOS_TABLE)
        .where(`${CAMERA}`, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .where(IS_TEMPORAL, 0)
        .select(PATH)
    return videos ? videos[0].id : null
}

function markVideoAsLocallyStored(old_path, new_path) {
    return knex(VIDEOS_TABLE)
        .where('path', old_path)
        .update({ 'path': new_path, 'node': 1, 'is_in_node': false })
}

async function getVideo(id) {
    return knex(VIDEOS_TABLE)
        .where(ID, id)
        .select(ID)
        .select(PATH)
        .select(DATE)
        .select(CAMERA)
        .select(NODE)
        .select(IS_IN_NODE)
}

function getAllTemporalVideos(camera) {
    return knex(VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(IS_TEMPORAL, 1)
        .select(ID)
        .select(PATH)
        .select(DATE)
        .select(NODE)
        .select(IS_IN_NODE)
        .orderBy(PATH, 'asc')
}

function getAllTemporalVideosInDate(camera, date) {
    return knex(VIDEOS_TABLE)
        .where(CAMERA, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .where(IS_TEMPORAL, 1)
        .select(ID)
        .select(PATH)
        .select(NODE)
        .select(IS_IN_NODE)
        .orderBy(PATH, 'asc')
}

function deleteVideo(id) {
    return knex(VIDEOS_TABLE)
        .where(ID, id)
        .del()
}

module.exports = {
    logVideo,
    getAllFinalVideos,
    getFinalVideosBetweenDates,
    getFinalVideoPath,
    markVideoAsLocallyStored,
    getVideo,
    getAllTemporalVideos,
    getAllTemporalVideosInDate,
    deleteVideo,
    getFinalVideoId
}