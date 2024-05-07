const dao = require('../models/dao/video')
const {statSync} = require('fs')
const moment = require('moment/moment')
const Video = require('../models/Video')

const BYTES_IN_A_GIGABYTE = 1024*1024*1024

function videoToObject(video) {
    const { path, date } = video
    let fileSize = statSync(path).size / BYTES_IN_A_GIGABYTE
    fileSize = String(fileSize).substring(0, 4)

    return {
        day: date,
        file_size: `${fileSize} GB`
    }
}

const registerVideo = async (camera, node, videoData) => {
    const { path, date } = videoData
    const video = {
        path: path,
        date: date,
        cameraId: camera,
        is_temporal: false,
        nodeId: node,
        is_in_node: true
    }
    await dao.logVideo(video)
    return video
}

const getVideo = async (camera, date) => {
    const id = await dao.getFinalVideoId(camera, date)
    const video = new Video(id)
    await video.load()
    return video
}

const getVideos = async (camera) => {
    let videos = await dao.getAllFinalVideos(camera)
    return videos.map(video => videoToObject(video))
}

const getVideosBetweenDatesForCamera = async (camera, start, end) => {
    start = moment(start, 'DD-MM-YYYY')
    end = moment(end, 'DD-MM-YYYY')

    const videos = await dao.getFinalVideosBetweenDates(camera, start, end)
    return videos.map(video => videoToObject(video))
}

const getFinalVideoPath = async (camera, date) => {
    const path = await dao.getFinalVideoPath(camera, date)
    if (!path) {
        const error = Error(`There are no videos from ${date}`)
        error.status = 404
        throw error
    }
    return path
}

module.exports = {
    getVideo,
    getVideos,
    getVideosBetweenDatesForCamera,
    getFinalVideoPath,
    registerVideo
}