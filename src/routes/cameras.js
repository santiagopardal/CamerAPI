const router = require('express').Router()
const videos = require('./videos')
const temporal_videos = require('./temporal_videos')
const ip = require('ip')
const { validateNode } = require('../dao/node_dao')
const dao = require('../dao/camera')
const connection_dao = require('../dao/connection_dao')
const { handleError } = require('../dao/database_error')
const requestToNode = require('../node_client/NodeClient')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another camera with that name'
}

async function validateCameraID(id) {
    const cam = await dao.getCamera(id)

    if (!cam) {
        const error = Error('There is no camera with such id')
        error.status = 404
        throw error
    }

    return cam
}

router.get('/:id/recording_status', async (request, response, next) => {
    try {
        let { node } = await validateCameraID(request.params.id)
        node = await validateNode(node)
        let nodeIp = node.ip
        // TODO Fix this, try to resolve and it resolves to localhost, then it is.
        if (['::ffff:172.18.0.1', '::ffff:172.0.0.1', '127.0.0.1', 'localhost'].includes(node.ip))
            nodeIp = ip.address()

        let nodeRequest = {
            method: 'is_recording',
            args: request.params.id
        }

        let nodeResponse = await requestToNode(nodeIp, nodeRequest)
        response.status(200).json({isRecording: nodeResponse.result})
    } catch (error) {
        next(error)
    }
})

router.post('/:id/recording_status', async (request, response, next) => {
    try {
        let { node } = await validateCameraID(request.params.id)
        node = await validateNode(node)
        let nodeIp = node.ip
        // TODO Fix this, try to resolve and it resolves to localhost, then it is.
        if (['::ffff:172.18.0.1', '::ffff:172.0.0.1', '127.0.0.1', 'localhost'].includes(node.ip))
            nodeIp = ip.address()

        let nodeRequest = {
            method: request.body.record ? 'record' : 'stop_recording',
            args: [request.params.id]
        }

        await requestToNode(nodeIp, nodeRequest)
        response.status(200).send('Ok')
    } catch (error) {
        next(error)
    }
})

router.post('/', async (request, response, next) => {
    try {
        await validateNode(request.body.node_id)
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
        if (request.params.node_id) {
            validateNode(request.params.node_id)
        }
        await validateCameraID(request.params.id)
        await dao.updateCamera(request.params.id, request.body)
        const cameraUpdated = await dao.getCamera(request.params.id)
        response.status(200).json(cameraUpdated)
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', async (request, response, next) => {
    try {
        await validateCameraID(request.params.id)
        await dao.deleteCamera(request.params.id)
        response.status(204).send()
    }
    catch(error) {
        next(error)
    }
})

router.get('/:id', async (request, response, next) => {
    try {
        let result = await validateCameraID(request.params.id)
        response.status(200).json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/snapshot/:id', async (request, response, next) => {
    try {
        let { node } = await validateCameraID(request.params.id)
        node = await validateNode(node)
        let nodeIp = node.ip
        // TODO Fix this, try to resolve and it resolves to localhost, then it is.
        if (['::ffff:172.18.0.1', '::ffff:172.0.0.1', '127.0.0.1', 'localhost'].includes(node.ip))
            nodeIp = ip.address()

        let nodeRequest = {
            method: 'get_snapshot_url',
            args: request.params.id
        }

        let nodeResponse = await requestToNode(nodeIp, nodeRequest)

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
        return next(error)
    }
})

router.get('/node/:id', async (request, response, next) => {
    try {
        await validateNode(request.params.id)
        let cameras = await dao.getInNode(request.params.id)
        response.status(200).json(cameras)
    } catch (e) {
        next(e)
    }
})

router.get('/', async (_, response, next) => {
    try {
        let result = await dao.getAllCameras()
        response.status(200).json(result)
    } catch (e) {
        next(e)
    }
})

router.use('/:id/temporal_videos/', async (req, res, next) => {
    try {
        await validateCameraID(req.params.id)
        req.camera = req.params.id
        next()
    } catch (error) {
        next(error)
    }
}, temporal_videos)

router.use('/:id/videos/', async (req, res, next) => {
    try {
        await validateCameraID(req.params.id)
        req.camera = req.params.id
        next()
    } catch (error) {
        next(error)
    }
}, videos)

module.exports = router
