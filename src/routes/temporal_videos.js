const router = require('express').Router()
const db = require('../database/temporal_video')
const { validateCameraID } = require('../routes/cameras')
const { handleError } = require('../database/database_error')
const { saveFilePart, videoPath } = require('../video_handler')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
}

async function logNewTemporalVideo(request, locallyStored) {
    await validateCameraID(request.params.camera)
    const video = {
        path: request.query.path,
        date: request.params.date,
        camera: request.params.camera,
        locally_stored: locallyStored || false
    }
    await db.logVideo(video)
    return video
}

router.get('/:camera/', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        let videos = await db.getAllVideos(request.params.camera)
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.get('/:camera/:date', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        let videos = await db.getAllVideosInDate(request.params.camera, request.params.date)
        videos = videos.map(video => video.path)
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.put('/:camera/:date/', async (request, response, next) => {
    try {
        await saveFilePart(request.body.chunk, request.body.filename, request.params.camera, request.params.date)
        if (parseInt(request.body.part) === parseInt(request.body.parts) - 1) {
            request.query.path = await videoPath(request.body.filename, request.params.camera, request.params.date)
            await logNewTemporalVideo(request, true)
        }
        response.status(206).send()
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.post('/:camera/:date/', async (request, response, next) => {
    try {
        const video = await logNewTemporalVideo(request, false)
        response.status(201).json(video)
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:camera/:date', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        await db.deleteAllVideosInDate(request.params.camera, request.params.date)
        response.status(204).send()
    } catch (e) {
        next(e)
    }
})

module.exports = router
