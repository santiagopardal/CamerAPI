const Video = require('../models/Video')
const videoHandler = require('../video_handler')
const dao = require('../models/dao/video')
const Node = require('../models/Node')

const getVideo = async (id) => {
    const video = new Video(id)
    await video.load()
    return video
}

const deleteVideo = async (videoId) => {
    const video = await getVideo(videoId)
    const promises = []

    if (!video.isInNode) {
        promises.push(video.delete(video.path))
    }

    promises.push(dao.deleteVideo(videoId))
    await Promise.all(promises)
}

const getAllVideosInCamera = async (cameraId) => {
    return await dao.getAllTemporalVideos(cameraId)
}

const getAllVideosInDateForCamera = async (camera, date) => {
    return await dao.getAllTemporalVideosInDate(camera, date)
}

const addNewPart = async (camera, date, partData) => {
    let  { part, parts, chunk, filename, old_path, upload_complete } = partData
    part = parseInt(part)
    parts = parseInt(parts)
    const uploadIsComplete = upload_complete === 'True'

    if (uploadIsComplete) {
        const [newPath, storePromise] = await videoHandler.createVideosFromParts(parts, filename, camera, date)
        const saveRecordPromise = dao.markVideoAsLocallyStored(old_path, newPath)
        const [_, [temporalVideo]] = await Promise.all([storePromise, saveRecordPromise])
        return temporalVideo.id
    } else {
        await videoHandler.saveFilePart(part, chunk, filename, camera, date)
    }

    return null
}

const registerNewVideo = async (nodeId, cameraId, videoData) => {
    const node = new Node(nodeId)
    await node.load()
    const { path, date } = videoData
    const video = {
        path: path,
        date: date,
        cameraId: cameraId,
        nodeId: nodeId,
        is_in_node: true
    }
    await dao.logVideo(video)
    return video
}

module.exports = {
    getVideo,
    deleteVideo,
    getAllVideosInCamera,
    getAllVideosInDateForCamera,
    addNewPart,
    registerNewVideo
}
