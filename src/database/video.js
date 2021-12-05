const knex = require("./knex")

function logVideo(video) {
    return knex("video").insert(video)
}

function getAllVideos(cameraName) {
    return knex("video")
        .join("camera", "camera.id", "video.camera")
        .where("camera.name", cameraName)
        .select("path")
        .select("date")
}

async function getVideoPath(camera, date) {
    return (await knex("video")
        .join("camera", "camera.id", "video.camera")
        .where("camera.name", camera)
        .where("video.date", date)
        .select("path"))[0]
}

module.exports = {
    logVideo,
    getAllVideos,
    getVideoPath
}