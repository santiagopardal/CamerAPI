const router = require('express').Router()
const tryCatch = require('../controllers/tryCatch')
const { parseRequestDate } = require('../utils/DateUtils')
const { getVideo, deleteVideo, getAllVideosInCamera, getAllVideosInDateForCamera, addNewPart, registerNewVideo } = require('../controllers/TemporalVideoController')

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
        response.status(200).json(await getAllVideosInDateForCamera(request.camera, parseRequestDate(request.params.date)))
    })
)

router.put('/:date/', tryCatch(
    async (request, response) => {
        const videoId = await addNewPart(request.camera, parseRequestDate(request.params.date), request.body)
        const status = videoId ? 201 : 200
        response.status(status).json({ upload_complete: !!videoId, temporal_video_id: videoId })
    })
)

router.post('/:date/', tryCatch(
    async (request, response) => {
        const videoData = { path: request.body.path, date: parseRequestDate(request.params.date) }
        const video = await registerNewVideo(request.headers.node_id, request.camera, videoData)
        response.status(201).json(video)
    })
)

router.delete('/:id', tryCatch(
    async (request, response) => {
        await deleteVideo(request.params.id)
        response.status(204).send()
    })
)

module.exports = router
