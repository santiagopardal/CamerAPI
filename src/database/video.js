const knex = require('./knex')
const { CAMERAS_TABLE, VIDEOS_TABLE } = require('../constants')

const CAMERA = 'camera'
const PATH = 'path'
const DATE = 'date'
const ID = 'id'
const NAME = 'name'

function logVideo(video) {
    return knex(VIDEOS_TABLE).insert(video)
}

function getAllVideos(cameraName) {
    return knex(VIDEOS_TABLE)
        .join(CAMERAS_TABLE, `${CAMERAS_TABLE}.${ID}`, `${VIDEOS_TABLE}.${CAMERA}`)
        .where(`${CAMERAS_TABLE}.${NAME}`, cameraName)
        .select(PATH)
        .select(DATE)
}

async function getVideoPath(camera, date) {
    return (await knex(VIDEOS_TABLE)
        .join(CAMERAS_TABLE, `${CAMERAS_TABLE}.${ID}`, `${VIDEOS_TABLE}.${CAMERA}`)
        .where(`${CAMERAS_TABLE}.${NAME}`, camera)
        .where(`${VIDEOS_TABLE}.${DATE}`, date)
        .select(PATH))[0]
}

module.exports = {
    logVideo,
    getAllVideos,
    getVideoPath
}