const knex = require("./knex")

function logVideo(video) {
    return knex("temporal_video").insert(video)
}

function getAllVideos(camera) {
    return knex("temporal_video")
        .where("camera", camera)
        .select("path")
        .select("date")
}

function getAllVideosInDate(camera, date) {
    return knex("temporal_video")
        .where("camera", camera)
        .where("temporal_video.date", date)
        .select("path")
}

function deleteAllVideosInDate(camera, date) {
    return knex("temporal_video")
        .where("camera", camera)
        .where("temporal_video.date", date)
        .del()
}

module.exports = {
    logVideo,
    getAllVideos,
    getAllVideosInDate,
    deleteAllVideosInDate
}