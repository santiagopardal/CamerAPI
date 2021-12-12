const router = require('express').Router()
const { statSync } = require('fs')
const db = require('../database/video')
const { validateCameraID } = require('../routes/cameras')
const { SQLITE_CONSTRAINT } = require('../database/database_error')

function videoToObject(video) {
    let file_s = statSync(video.path).size/(1024*1024*1024)
    file_s = String(file_s).substr(0, 4)

    return { 
        day: video.date,
        file_size: `${file_s} GB`
    }
}

function handleError(error) {
    if (error.code === SQLITE_CONSTRAINT) {
        error = {
            message: 'There is another video with that path',
            status: 409
        }
    }

    return error
}

router.get('/:camera/', async (request, response, next) => {
    try {
        let videos = await db.getAllVideos(request.params.camera)
        videos = videos.map(video => videoToObject(video))
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.post('/:camera/:date/', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        const video = {
            path: request.query.path,
            date: request.params.date,
            camera: request.params.camera
        }
        await db.logVideo(video)
        response.status(200).json(video)
    } catch (e) {
        let error = handleError(e)
        next(error)
    }
})

router.get('/:camera/download/:date', async (request, response, next) => {
    try {
        const pth = await db.getVideoPath(request.params.camera, request.params.date)

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
