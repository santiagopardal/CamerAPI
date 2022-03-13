const router = require('express').Router()
const { statSync } = require('fs')
const db = require('../dao/video')
const { handleError } = require('../dao/database_error')

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
        const pth = await db.getFinalVideoPath(request.camera, request.params.date)

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

module.exports = router
