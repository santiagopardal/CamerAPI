const router = require('express').Router()
const temporal_videos = require('./temporal_videos')
const videos = require('./videos')
const { validateNode } = require('./node')
const dao = require('../dao/camera')
const connection_dao = require('../dao/connection_dao')
const { handleError } = require('../dao/database_error')

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

router.post('/', async (request, response, next) => {
    try {
        await dao.createCamera(request.query)
        await validateNode(request.headers.node_id)
        response.status(201).json(request.query)
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
            message: request.query.message,
            date: request.query.date
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
        if (request.params.node) {
            validateNode(request.params.node)
        }
        await validateCameraID(request.params.id)
        await dao.updateCamera(request.params.id, request.query)
        const cameraUpdated = await dao.getCamera(request.params.id)
        response.status(200).json(cameraUpdated);
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

router.get('/node/:id', async (request, response, next) => {
    try {
        await validateNode(request.params.id)
        let cameras = dao.getInNode(request.params.id)
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
        req.camera = req.params.id;
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
