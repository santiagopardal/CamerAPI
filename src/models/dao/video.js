const moment = require('moment')
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

function logVideo(video) {
    return prisma.video.create(
        {
            data: video
        }
    )
}

function getAllFinalVideos(cameraId) {
    return prisma.video.findMany(
        {
            where: { is_temporal: false, cameraId: parseInt(cameraId, 10) }
        }
    )
}

async function getFinalVideosBetweenDates(cameraId, startingDate, endingDate) {
    const videos = await getAllFinalVideos(cameraId)
    return videos.filter(video => startingDate <= moment(video.date, 'DD-MM-YYYY') && moment(video.date, 'DD-MM-YYYY') <= endingDate)
}

async function getFinalVideoPath(camera, date) {
    const video = await prisma.video.findFirst(
        {
            where: {
                cameraId: parseInt(camera, 10),
                date: moment(date, 'DD-MM-YYYY'),
                is_temporal: false
            },
            select: { path: true }
        }
    )

    return video.path
}

async function getFinalVideoId(camera, date) {
    const video = await prisma.video.findFirst(
        {
            where: {
                cameraId: parseInt(camera, 10),
                date: moment(date, 'DD-MM-YYYY'),
                is_temporal: false
            },
            select: { id: true }
        }
    )

    return video.id
}

async function markVideoAsLocallyStored(old_path, new_path) {
    const video = await prisma.video.update(
        {
            where: { path: old_path },
            data: {
                nodeId: 1,
                is_in_node: false
            }
        }
    )
    return video.id
}

async function getVideo(id) {
    return prisma.video.findFirst(
        {
            where: {id: parseInt(id, 10)}
        }
    );
}

function getAllTemporalVideos(camera) {
    return prisma.video.findMany(
        {
            where: { is_temporal: true, cameraId: parseInt(camera, 10) },
            orderBy: { path: "asc" }
        }
    )
}

function getAllTemporalVideosInDate(camera, date) {
    return prisma.video.findMany(
        {
            where: {
                is_temporal: true,
                cameraId: parseInt(camera, 10),
                date: moment(date, 'DD-MM-YYYY')
            },
            orderBy: { path: "asc" }
        }
    )
}

function deleteVideo(id) {
    return prisma.video.delete({ where: {id: parseInt(id, 10) } })
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