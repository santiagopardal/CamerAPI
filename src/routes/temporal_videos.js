const router = require('express').Router()
const tryCatch = require('../controllers/tryCatch')
const { deleteVideo, registerNewVideo } = require('../controllers/TemporalVideoController')

router.post('/', tryCatch(
    async (request, response) => {
        const date = new Date(request.body.dateTimestamp * 1000)
        const videoData = { path: request.body.path, date: date }
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
