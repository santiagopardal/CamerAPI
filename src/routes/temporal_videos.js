const router = require('express').Router()
const db = require('../database/temporal_video')
const { validateCameraID } = require('../routes/cameras')
const { handleError } = require('../database/database_error')
const { saveFilePart, createVideosFromParts } = require('../video_handler')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
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
        const part = parseInt(request.body.part)
        const parts = parseInt(request.body.parts)

        await saveFilePart(part, request.body.chunk, request.body.filename, request.params.camera, request.params.date)

        if (part === parts - 1) {
            const newPath = await createVideosFromParts(
                parts,
                request.body.filename,
                request.params.camera,
                request.params.date
            )
            await db.markVideoAsLocallyStored(request.query.old_path, newPath)
        }

        response.status(206).send()
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
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
