const router = require('express').Router()
const { statSync } = require('fs')
const db = require('../dao/video')
const { handleError } = require('../dao/database_error')
const fs = require("fs")

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
}

function videoToObject(video) {
    let file_s = statSync(video.path).size/(1024*1024*1024)
    file_s = String(file_s).substr(0, 4)

    return { 
        day: video.date,
        file_size: `${file_s} GB`
    }
}

router.get('/', async (request, response, next) => {
    try {
        let videos = await db.getAllFinalVideos(request.camera)
        videos = videos.map(video => videoToObject(video))
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.post('/:date/', async (request, response, next) => {
    try {
        const video = {
            path: request.query.path,
            date: request.params.date,
            camera: request.camera,
            is_temporal: false
        }
        await db.logVideo(video)
        response.status(201).json(video)
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.get('/download/:date', async (request, response, next) => {
    try {
        const pth = (await db.getFinalVideoPath(request.camera, request.params.date)).path
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
        const videoPath = (await db.getFinalVideoPath(request.camera, request.params.date)).path
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
