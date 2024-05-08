const Video = require('../models/Video')
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

const registerNewVideo = async (nodeId, cameraId, videoData) => {
    const node = new Node(nodeId)
    await node.load()
    const { path, date } = videoData
    const video = {
        path: path,
        date: date,
        cameraId: cameraId,
        nodeId: nodeId,
        is_in_node: true,
        is_temporal: true
    }
    await dao.logVideo(video)
    return video
}

module.exports = {
    getVideo,
    deleteVideo,
    registerNewVideo
}
