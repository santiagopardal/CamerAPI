const router = require('express').Router()
const videos = require('./videos')
const temporal_videos = require('./temporal_videos')
const { validateNode } = require('../dao/node_dao')
const dao = require('../dao/camera')
const connection_dao = require('../dao/connection_dao')
const { handleError } = require('../dao/database_error')
const requestToNode = require('../node_client/NodeClient')
const { validateCameraID, getNodeIp } = require('../utils/cameras')
const tryCatch = require('../controllers/tryCatch')
const CameraController = require('../controllers/CameraController')


const Camera = require('../models/Camera')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another camera with that name'
}

const cameraController = new CameraController()

router.get('/:id/is_online', tryCatch(
    async (request, response) => {
        const camera = await cameraController.get(request.params.id)
        const isOnline = await camera.isOnline()
        response.status(200).json({ isOnline: isOnline})
    }
))

router.post('/:id/recording_status', tryCatch(
    async (request, response) => {
        const camera = await cameraController.get(request.params.id)
        const isRecording = await camera.switchRecording(request.body.record)
        response.status(200).json({isRecording: isRecording})
    })
)

router.post('/', async (request, response, next) => {
    try {
        const camera = new Camera()
        await camera.setValues(request.body)
        await camera.save()
        response.status(201).json(request.body)
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.post('/:id/connection_status/', async (request, response, next) => {
    try {
        await cameraController.get(request.params.id)
        let status = {
            camera: request.params.id,
            message: request.body.message,
            date: request.body.date
        }

        if (!status.message || ! status.date) {
            const error = Error('Connection message or date missing.')
            error.status = 400
            next(error)
        }

        await connection_dao.logStatus(status)
        response.status(200).send()
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.patch('/:id', async (request, response, next) => {
    try {
        const oldCamera = await cameraController.get(request.params.id)
        const newCamera = new Camera(request.params.id)
        await newCamera.setValues(request.body)
        if (oldCamera.configurations.sensitivity !== newCamera.configurations.sensitivity) {
            const node = getNodeIp(newCamera.id)
            await requestToNode(node.ip, 'update_sensitivity', {camera_id: newCamera.id, sensitivity: newCamera.configurations.sensitivity})
        }
        await newCamera.save()
        response.status(200).json(newCamera.toJSON())
    } catch (error) {
        console.log(error)
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', tryCatch(
    async (request, response) => {
        const camera = await cameraController.get(request.params.id)
        await camera.delete()
        response.status(204).send()
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
        const camera = new Camera(request.params.id)
        await camera.load()
        response.status(200).json(camera.toJSON())
    })
)

router.get('/snapshot/:id', async (request, response, next) => {
    try {
        let nodeIp = await getNodeIp(request.params.id)
        let nodeResponse = await requestToNode(nodeIp, 'get_snapshot_url', request.params.id)
        let cameraResponse = await fetch(nodeResponse.result)
        let responseBlob = await cameraResponse.blob()
        let arrayBuffer = await responseBlob.arrayBuffer()
        let buffer = Buffer.from(arrayBuffer)
        response.type(responseBlob.type)
        response.send(buffer)
    } catch (err) {
        let error = { message: `Could not connect to camera: ${err}`, status: 500 }
        if (err.cause && err.cause.code === 'EHOSTUNREACH') {
            error.message = 'Could not connect to camera, camera was unreachable'
            error.status = 503
        }
        next(error)
    }
})

router.get('/node/:id', tryCatch(
    async (request, response) => {
        await validateNode(request.params.id)
        let cameras = await dao.getInNode(request.params.id)
        response.status(200).json(cameras)
    })
)

router.get('/', tryCatch(
    async (_, response) => {
        const cameras = await cameraController.getAll()
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
