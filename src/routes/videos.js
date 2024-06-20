const router = require('express').Router()
const tryCatch = require('../controllers/tryCatch')
const { parseRequestDate } = require('../utils/DateUtils')
const { registerVideo, getVideo, getVideos, getVideosBetweenDatesForCamera, getFinalVideoPath } = require('../controllers/VideoController')

router.get('/', tryCatch(
    async (request, response) => {
        response.status(200).json(await getVideos(request.camera))
    })
)
router.get('/from/:startingDate/to/:endingDate', tryCatch(
    async (request, response, next) => {
        const { startingDate, endingDate } = request.params
        const videos = await getVideosBetweenDatesForCamera(request.camera, startingDate, endingDate)
        response.status(200).json(videos)
    })
)

router.post('/:date/', tryCatch(
    async (request, response, next) => {
        const date = new Date(request.body.dateTimestamp * 1000)
        const videoData = { path: request.body.path, date: date }
        const video = await registerVideo(request.camera, request.headers.node_id, videoData)
        response.status(201).json(video)
    })
)

router.get('/download/:date', tryCatch(
    async (request, response) => {
        const pth = await getFinalVideoPath(request.camera, parseRequestDate(request.params.date))
        response.sendFile(pth)
    })
)

router.get('/stream/:date', tryCatch(
    async (request, response) => {
        const video = await getVideo(request.camera, parseRequestDate(request.params.date))
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

module.exports = router
