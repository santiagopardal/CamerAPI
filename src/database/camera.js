const knex = require("./knex")

function createCamera(camera) {
    return knex("camera").insert(camera)
}

function getAllCameras() {
    return knex("camera").select("*")
}

async function getCamera(id) {
    return (await knex("camera").where("id", id).select("*"))[0]
}

function deleteCamera(cameraId) {
    return knex("camera").where("id", cameraId).del()
}

function updateCamera(cameraId, camera) {
    return knex("camera").where("id", cameraId).update(camera)
}

module.exports = {
    createCamera,
    getAllCameras,
    getCamera,
    deleteCamera,
    updateCamera
}