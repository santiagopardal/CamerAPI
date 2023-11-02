const router = require('express').Router()
const videos = require('./videos')
const temporal_videos = require('./temporal_videos')
const Node = require('../models/Node')
const { handleError } = require('../dao/database_error')
const tryCatch = require('../controllers/tryCatch')
const { getCamera, getAll, isOnline, switchRecording, createNew, updateConnectionStatus, edit, deleteCamera, getSnapshot, validateCameraID } = require('../controllers/camera')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another camera with that name'
}

router.get('/:id/is_online', tryCatch(
    async (request, response) => {
        const cameraIsOnline = await isOnline(request.params.id)
        response.status(200).json({ isOnline: cameraIsOnline})
    }
))

router.post('/:id/recording_status', tryCatch(
    async (request, response) => {
        const isRecording = switchRecording(request.params.id, request.body.record)
        response.status(200).json({isRecording: isRecording})
    })
)

router.post('/', async (request, response, next) => {
    try {
        await createNew(request.body)
        response.status(201).json(request.body)
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.post('/:id/connection_status/', async (request, response, next) => {
    try {
        await updateConnectionStatus(request.params.id, request.body.message, request.body.date)
        response.status(200).send()
    } catch (error) {
        next(error)
    }
})

router.patch('/:id', async (request, response, next) => {
    try {
        const newCamera = await edit(request.params.id, request.body)
        response.status(200).json(newCamera.toJSON())
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', tryCatch(
    async (request, response) => {
        await deleteCamera(request.params.id)
        response.status(204).send()
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
        const camera = await getCamera(request.params.id)
        response.status(200).json(camera.toJSON())
    })
)

router.get('/snapshot/:id', async (request, response, next) => {
    try {
        const snapshot = await getSnapshot(request.params.id)
        const responseBlob = await snapshot.blob()
        const arrayBuffer = await responseBlob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        response.type(responseBlob.type)
        response.send(buffer)
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
        const node = new Node(request.params.id)
        await node.load()
        response.status(200).json(await node.getCameras())
    })
)

router.get('/', tryCatch(
    async (_, response) => {
        const cameras = await getAll()
        response.status(200).json(cameras.map(camera => camera.toJSON()))
    })
)

router.use('/:id/temporal_videos/', async (req, res, next) => {
    await validateCameraID(req.params.id)
    req.camera = req.params.id
    next()
},
temporal_videos
)

router.use('/:id/videos/', async (req, res, next) => {
    await validateCameraID(req.params.id)
    req.camera = req.params.id
    next()
},
videos
)

module.exports = router
