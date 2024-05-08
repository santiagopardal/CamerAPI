const router = require('express').Router()
const tryCatch = require('../controllers/tryCatch')
const { parseRequestDate } = require('../utils/DateUtils')
const { deleteVideo, registerNewVideo } = require('../controllers/TemporalVideoController')

router.post('/:date/', tryCatch(
    async (request, response) => {
        const videoData = { path: request.body.path, date: parseRequestDate(request.params.date) }
        const video = await registerNewVideo(
            parseInt(request.headers.node_id, 10),
            parseInt(request.camera, 10),
            videoData
        )
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
