const router = require('express').Router()
const db = require('../dao/video')
const { validateCameraID } = require('../routes/cameras')
const { handleError } = require('../dao/database_error')
const videoHandler = require('../video_handler')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
}

async function validateVideoExists(id) {
    let video = await db.getVideo(id)

    if (!video) {
        const error = Error('There is no video with such id')
        error.status = 404

        throw error
    }
    video = video[0]

    return video
}

router.get('/:id/stream/', async function(request, response, next) {
    try {
        const video = await validateVideoExists(request.params.id)
        const path = video.path
        const fileSize = videoHandler.getFileSize(path)
        const range = request.headers.range
        let options = null
        let head
        let statusCode

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunkSize = end - start + 1

            statusCode = 206
            head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            }
            options = {start, end}
        } else {
            statusCode = 200
            head = { 'Content-Length': fileSize,  'Content-Type': 'video/mp4' }
        }

        const readStream = videoHandler.createReadStream(path, options)
        response.writeHead(statusCode, head);
        readStream.pipe(response);
    } catch (e) {
        next(e)
    }
});

router.get('/camera/:camera/', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        let videos = await db.getAllTemporalVideos(request.params.camera)
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.get('/camera/:camera/:date', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        let videos = await db.getAllTemporalVideosInDate(request.params.camera, request.params.date)
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.put('/camera/:camera/:date/', async (request, response, next) => {
    try {
        const part = parseInt(request.body.part)
        const parts = parseInt(request.body.parts)

        await videoHandler.saveFilePart(part, request.body.chunk, request.body.filename, request.params.camera, request.params.date)

        if (part === parts - 1) {
            const newPath = await videoHandler.createVideosFromParts(
                parts,
                request.body.filename,
                request.params.camera,
                request.params.date
            )
            await db.markVideoAsLocallyStored(request.query.old_path, newPath)
        }

        response.status(200).send()
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        console.log(e)
        next(error)
    }
})

router.post('/camera/:camera/:date/', async (request, response, next) => {
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

router.delete('/:id', async (request, response, next) => {
    try {
        const video = await validateVideoExists(request.params.id)

        if (video.locally_stored) {
            videoHandler.deleteVideo(video.path)
        }
        await db.deleteVideo(request.params.id)
        response.status(204).send()
    } catch (e) {
        next(e)
    }
})


router.delete('/camera/:camera/:date', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        await db.deleteAllTemporalVideosInDate(request.params.camera, request.params.date)
        response.status(204).send()
    } catch (e) {
        next(e)
    }
})

module.exports = router
