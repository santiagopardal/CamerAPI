const router = require('express').Router()
const db = require('../dao/camera')
const { handleError } = require('../dao/database_error')

const ERROR_MESSAGES = {
    SQLITE_CONSTRAINT: 'There is another camera with that name'
}

async function validateCameraID(id) {
    const cam = await db.getCamera(id)

    if (!cam) {
        const error = Error('There is no camera with such id')
        error.status = 404

        throw error
    }

    return cam
}

router.post('/', async (request, response, next) => {
    try {
        await db.createCamera(request.query);
        response.status(201).json(request.query)
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.patch('/:id', async (request, response, next) => {
    try {
        await validateCameraID(request.params.id)
        await db.updateCamera(request.params.id, request.query)
        const cameraUpdated = await db.getCamera(request.params.id)
        response.status(200).json(cameraUpdated);
    } catch (error) {
        error = handleError(error, ERROR_MESSAGES)
        next(error)
    }
})

router.delete('/:id', async (request, response, next) => {
    try {
        await validateCameraID(request.params.id)
        await db.deleteCamera(request.params.id)

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

router.get('/', async (_, response, next) => {
    try {
        let result = await db.getAllCameras()
        response.status(200).json(result)
    } catch (e) {
        next(e)
    }
})

module.exports = {
    router,
    validateCameraID
}
