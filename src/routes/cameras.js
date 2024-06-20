const router = require('express').Router()
const videos = require('./videos')
const temporal_videos = require('./temporal_videos')
const tryCatch = require('../controllers/tryCatch')
const { getNodeCameras } = require('../controllers/NodeController')
const { getCamera, getAll, isOnline, switchRecording, createNew, updateConnectionStatus, edit, deleteCamera, getSnapshot } = require('../controllers/CameraController')

router.get('/:id/is_online', tryCatch(
    async (request, response) => {
        const cameraIsOnline = await isOnline(request.params.id)
        response.status(200).json({ isOnline: cameraIsOnline})
    }
))

router.post('/:id/recording_status', tryCatch(
    async (request, response) => {
        const isRecording = await switchRecording(request.params.id, request.body.record)
        response.status(200).json({isRecording: isRecording})
    })
)

router.post('/', tryCatch(
    async (request, response) => {
        const camera = await createNew(request.body)
        response.status(201).json(camera)
    })
)

router.post('/:id/connection_status/', tryCatch(
    async (request, response) => {
        await updateConnectionStatus(request.params.id, request.body.message, request.body.date)
        response.status(200).send()
    })
)

router.patch('/:id', tryCatch(
    async (request, response) => {
        const cameraId = parseInt(request.params.id)
        const newCamera = await edit(cameraId, request.body)
        response.status(200).json(newCamera)
    })
)

router.delete('/:id', tryCatch(
    async (request, response) => {
        await deleteCamera(request.params.id)
        response.status(204).send()
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
        const camera = await getCamera(request.params.id)
        response.status(200).json(camera)
    })
)

router.get('/snapshot/:id', async (request, response, next) => {
    try {
        const snapshot = await getSnapshot(request.params.id)
        response.type("image/jpeg")
        response.send(snapshot)
    } catch (err) {
        const error = { message: `Could not connect to camera: ${err}`, status: 500 }
        if (err.cause && err.cause.code === 'EHOSTUNREACH') {
            error.message = 'Could not connect to camera, camera was unreachable'
            error.status = 503
        }
        next(error)
    }
})

router.get('/node/:id', tryCatch(
    async (request, response) => {
        response.status(200).json(await getNodeCameras(request.params.id))
    })
)

router.get('/', tryCatch(
    async (_, response) => {
        const cameras = await getAll()
        response.status(200).json(cameras)
    })
)

router.use('/:id/temporal_videos/', async (req, res, next) => {
    await getCamera(req.params.id)
    req.camera = req.params.id
    next()
},
temporal_videos
)

router.use('/:id/videos/', async (req, res, next) => {
    await getCamera(req.params.id)
    req.camera = req.params.id
    next()
},
videos
)

module.exports = router
