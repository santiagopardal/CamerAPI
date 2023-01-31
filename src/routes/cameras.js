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

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another camera with that name'
}

router.get('/:id/is_online', tryCatch(
    async (request, response) => {
        let camera = await validateCameraID(request.params.id)
        let lastStatus = await dao.getLastStatus(camera.id)
        response
            .status(200)
            .json(
                {
                    isOnline: lastStatus.length > 0 && lastStatus.pop().message === 'Connected'
                }
            )
    }
))

router.post('/:id/recording_status', tryCatch(
    async (request, response) => {
        let nodeIp = await getNodeIp(request.params.id)

        let method = request.body.record ? 'record' : 'stop_recording'
        let args = [request.params.id]

        let nodeResponse = await requestToNode(nodeIp, method, args)
        let isRecording = nodeResponse.result[request.params.id]
        response.status(200).json({isRecording: isRecording})
    })
)

router.post('/', async (request, response, next) => {
    try {
        await dao.createCamera(request.body)
        response.status(201).json(request.body)
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.post('/:id/connection_status/', async (request, response, next) => {
    try {
        await validateCameraID(request.params.id)
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
        let cameraId = parseInt(request.params.id)
        if (request.params.id) {
            await validateCameraID(request.params.id)
        }
        await validateCameraID(request.params.id)
        await dao.updateCamera(cameraId, request.body)
        const cameraUpdated = await dao.getCamera(request.params.id)
        response.status(200).json(cameraUpdated)
    } catch (error) {
        console.log(error)
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', tryCatch(
    async (request, response) => {
        await validateCameraID(request.params.id)
        await dao.deleteCamera(request.params.id)
        response.status(204).send()
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
       let result = await validateCameraID(request.params.id)
        response.status(200).json(result)
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
        let result = await dao.getAllCameras()
        response.status(200).json(result)
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
