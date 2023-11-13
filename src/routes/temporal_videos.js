const router = require('express').Router()
const { handleError } = require('../models/dao/database_error')
const tryCatch = require('../controllers/tryCatch')
const { getVideo, deleteVideo, getAllVideosInCamera, getAllVideosInDateForCamera, addNewPart, registerNewVideo } = require('../controllers/TemporalVideoController')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another video with that path'
}

router.get('/:id/stream/', tryCatch(
    async (request, response) => {
        const video = await getVideo(request.params.id)
        const fileSize = video.getSize()
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

        const readStream = video.createReadStream(options)
        response.writeHead(statusCode, head);
        readStream.pipe(response);
    })
)

router.get('/', tryCatch(
    async (request, response) => {
        const videos = await getAllVideosInCamera(request.camera)
        response.status(200).json(videos)
    })
)

router.get('/:date', tryCatch(
    async (request, response) => {
        const [day, month, year] = request.params.date.split('-').map(number => parseInt(number, 10))
        response.status(200).json(await getAllVideosInDateForCamera(request.camera, new Date(year, month - 1, day)))
    })
)

router.put('/:date/', async (request, response, next) => {
    try {
        const [day, month, year] = request.params.date.split('-').map(number => parseInt(number, 10))
        const uploadIsComplete = await addNewPart(request.camera, new Date(year, month - 1, day), request.body)
        const status = uploadIsComplete ? 201 : 200
        response.status(status).send()
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.post('/:date/', async (request, response, next) => {
    try {
        const [day, month, year] = request.params.date.split('-').map(number => parseInt(number, 10))
        const videoData = { path: request.body.path, date: new Date(year, month - 1, day) }
        const video = await registerNewVideo(request.headers.node_id, request.camera, videoData)
        response.status(201).json(video)
    } catch (e) {
        let error = handleError(e, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', tryCatch(
    async (request, response) => {
        await deleteVideo(request.params.id)
        response.status(204).send()
    })
)

module.exports = router
