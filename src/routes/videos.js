const router = require('express').Router()
const { readdirSync, statSync, existsSync, createReadStream } = require('fs');
const path = require('path')
const moment = require('moment')
const { VIDEOS_PATH } = require('../constants');

function validateCamera(cameraID) {
    if (!(cameraID in global.CAMERAS)) {
        const error = Error('That camera does not exist')
        error.status = 404

        throw error
    }
}

function transformDate(date) {
    var date = moment(date, 'DD-MM-YYYY', true)

    if (!date.isValid()) {
        const error = Error('Date is invalid')
        error.status = 400

        throw error
    }
    return date.format('YYYY-MM-DD')
}

function filenameToObject(pth, file_name) {
    var file_s = statSync(path.join(pth, file_name)).size/(1024*1024*1024)
    file_s = String(file_s).substr(0, 4)

    return { 
        day: file_name.substring(0, file_name.length - 4),
        file_size: `${file_s} GB`
    }
}

function validateCameraAndDate(cameraID, request_date) {
    validateCamera(cameraID)

    const date = transformDate(request_date)

    const pth = path.join(VIDEOS_PATH, global.CAMERAS[cameraID].name, `${date}.mp4`)

    if (!existsSync(pth)) {
        const error = Error(`There are no videos from ${request_date}`)
        error.status = 404

        throw error
    }

    return pth
}

router.get('/:camera/', async (request, response, next) => {
    try {
        validateCamera(request.params.camera)

        const pth = path.join(VIDEOS_PATH, global.CAMERAS[request.params.camera].name)

        var videos = readdirSync(pth, { withFileTypes: true }).filter(dirent => dirent.name.endsWith('.mp4'))
        
        videos = videos.map(dirent => filenameToObject(pth, dirent.name))
        
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.get('/:camera/stream/:date', async (request, response, next) => {
    try {
        const pth = validateCameraAndDate(request.params.camera, request.params.date)

        const stat = statSync(pth)
        const fileSize = stat.size
        const range = request.headers.range
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1
            const chunkSize = (end-start)+1
            
            const file = createReadStream(pth, {start, end})
            
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            }

            response.writeHead(206, head);
            file.pipe(response);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }

            response.writeHead(200, head)
            createReadStream(pth).pipe(response)
        }
    } catch (e) {
        next(e)
    }
})

router.get('/:camera/download/:date', async (request, response, next) => {
    try {
        const pth = validateCameraAndDate(request.params.camera, request.params.date)

        response.download(pth)
    } catch (e) {
        next(e)
    }
})

module.exports = router
