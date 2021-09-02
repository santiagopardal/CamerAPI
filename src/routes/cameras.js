const router = require('express').Router()
const { writeFile, readFile } = require('fs');

readFile('cameras.json', (err, data) => {
    if (err)
        global.CAMERAS = {}
    else
        global.CAMERAS = JSON.parse(data);
});

function serializeCameras() {
    const toStore = JSON.stringify(global.CAMERAS)

    writeFile("./cameras.json", toStore, (err) => console.log(err))
}

function validateCameraID(id) {
    if (!CAMERAS[id]) {
        const error = Error('There is no camera with such id')
        error.status = 404

        throw error
    }
}

function validateNewCamera(camera) {
    if (!camera.name || !camera.model || !camera.ip || !camera.http_port ||
        !camera.user || !camera.password) {
            const error = Error('Some fields are missing')
            error.status = 400
            
            throw error
        }
    
    Object.values(global.CAMERAS).forEach(cam => {
        if (cam.name == camera.name) {
            const error = Error('There is a camera with that name')
            error.status = 400

            throw error
        }
    })
}

router.post('/', async (request, response, next) => {
    try {
        validateNewCamera(request.query)

        var id = 0
        
        Object.keys(global.CAMERAS).forEach(key => id = Math.max(id, key))
        
        id += 1

        request.query.id = id
        
        global.CAMERAS[id] = request.query

        serializeCameras()
        
        response.status(200).json(request.query)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', async (request, response, next) => {
    try {
        validateCameraID(request.params.id)

        Object.keys(request.query).forEach(key => {
            CAMERAS[request.params.id][key] = request.query[key]
        })

        response.status(200).send(CAMERAS[request.params.id])
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (request, response, next) => {
    try {
        validateCameraID(request.params.id)

        const cam = global.CAMERAS[request.params.id]
        delete global.CAMERAS[request.params.id]

        serializeCameras()

        response.status(200).send(cam)
    }
    catch(error) {
        next(error)
    }
})

router.get('/:id', async (request, response, next) => {
    try {
        validateCameraID(request.params.id)

        response.status(200).send(global.CAMERAS[request.params.id])
    } catch (error) {
        next(error)
    }
})

router.get('/', async (_, response, next) => {
    try {
        
        response.status(200).json(Object.values(global.CAMERAS))
    } catch (e) {
        next(e)
    }
})

module.exports = router
