const router = require('express').Router()
const { validateNode } = require('../dao/node_dao')
const dao = require('../dao/video')
const { handleError } = require('../dao/database_error')
const videoHandler = require('../video_handler')
const tryCatch = require('../controllers/tryCatch')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
}

async function validateVideoExists(id) {
    let video = await dao.getVideo(id)

    if (!video) {
        const error = Error('There is no video with such id')
        error.status = 404
        throw error
    }
    video = video[0]

    return video
}

router.get('/:id/stream/', tryCatch(
    async function(request, response) {
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
    })
)

router.get('/', tryCatch(
    async (request, response) => {
        let videos = await dao.getAllTemporalVideos(request.camera)
        response.status(200).json(videos)
    })
)

router.get('/:date', tryCatch(
    async (request, response) => {
        let videos = await dao.getAllTemporalVideosInDate(request.camera, request.params.date)
        response.status(200).json(videos)
    })
)

router.put('/:date/', async (request, response, next) => {
    try {
        let { part, parts, chunk, filename, old_path, upload_complete } = request.body
        part = parseInt(part)
        parts = parseInt(parts)
        upload_complete = upload_complete === 'True'
        if (upload_complete) {
            const newPath = await videoHandler.createVideosFromParts(
                parts,
                filename,
                request.camera,
                request.params.date
            )
            dao.markVideoAsLocallyStored(old_path, newPath)
            response.status(201).send()
        } else {
            await videoHandler.saveFilePart(part, chunk, filename, request.camera, request.params.date)
            response.status(200).send()
        }
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.post('/:date/', async (request, response, next) => {
    try {
        await validateNode(request.headers.node_id)
        const video = {
            path: request.body.path,
            date: request.params.date,
            camera: request.camera,
            node: request.headers.node_id
        }
        await dao.logVideo(video)
        response.status(201).json(video)
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', tryCatch(
    async (request, response) => {
        const video = await validateVideoExists(request.params.id)

        if (video.node_id === 1) {
            videoHandler.deleteVideo(video.path)
        }
        await dao.deleteVideo(request.params.id)
        response.status(204).send()
    })
)


router.delete('/:date', tryCatch(
    async (request, response) => {
        await dao.deleteAllTemporalVideosInDate(request.camera, request.params.date)
        response.status(204).send()
    })
)

module.exports = router
