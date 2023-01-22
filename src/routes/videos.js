const router = require('express').Router()
const { statSync } = require('fs')
const dao = require('../dao/video')
const { handleError } = require('../dao/database_error')
const fs = require("fs")
const moment = require('moment')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
}

const BYTES_TO_GIGABYTES = 1024*1024*1024

function videoToObject(video) {
    let { path, date } = video
    let fileSize = statSync(path).size/BYTES_TO_GIGABYTES
    fileSize = String(fileSize).substring(0, 4)

    return {
        day: date,
        file_size: `${fileSize} GB`
    }
}

router.get('/', async (request, response, next) => {
    try {
        let videos = await dao.getAllFinalVideos(request.camera)
        videos = videos.map(video => videoToObject(video))
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.get('/from/:startingDate/to/:endingDate', async (request, response, next) => {
    try {
        let { startingDate, endingDate } = request.params
        startingDate = moment(startingDate, 'DD-MM-YYYY')
        endingDate = moment(endingDate, 'DD-MM-YYYY')

        let videos = await dao.getFinalVideosBetweenDates(request.camera, startingDate, endingDate)
        videos = videos.map(video => videoToObject(video))

        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.post('/:date/', async (request, response, next) => {
    try {
        const video = {
            path: request.body.path,
            date: request.params.date,
            camera: request.camera,
            is_temporal: false,
            node: request.headers.node_id
        }
        await dao.logVideo(video)
        response.status(201).json(video)
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.get('/download/:date', async (request, response, next) => {
    try {
        const pth = await dao.getFinalVideoPath(request.camera, request.params.date)
        if (!pth) {
            const error = Error(`There are no videos from ${request.params.date}`)
            error.status = 404
            next(error)
        }
        response.sendFile(pth)
    } catch (e) {
        next(e)
    }
})

router.get('/stream/:date', async (request, response, next) => {
    try {
        const range = request.headers.range;
        if (!range) {
            response.status(400).send("Requires Range header");
        }
        const videoPath = await dao.getFinalVideoPath(request.camera, request.params.date)
        const videoSize = fs.statSync(videoPath).size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        response.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(response);
    } catch (e) {
        next(e)
    }
})

module.exports = router
