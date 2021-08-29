const router = require('express').Router()
const { readdirSync, statSync } = require('fs');
const { VALID_PLACES } = require('../constants')
const path = require('path')
require('../constants')

function validatePlace(place) {
    if (!VALID_PLACES.includes(place)) {
        const error = Error('Invalid place')
        error.status = 400

        throw error
    }
}

function filenameToObject(pth, file_name) {
    var file_s = statSync(path.join(pth, file_name)).size/(1024*1024*1024)
    file_s = String(file_s).substr(0, 4)

    return { 
        day: file_name.substring(0, file_name.length - 4),
        file_size: `${file_s} GB`
    }
}

router.get('/:place/videos', (request, response, next) => {
    try {
        validatePlace(request.params.place)

        const pth = path.join(VIDEOS_PATH, request.params.place)

        var videos = readdirSync(pth, { withFileTypes: true }).filter(dirent => dirent.name.endsWith('.mp4'))
        
        videos = videos.map(dirent => filenameToObject(pth, dirent.name))
        
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.get('/', (_, response, next) => {
    try {
        if (VALID_PLACES.length > 0)
            response.status(200).json(VALID_PLACES)
        else
            response.status(404).json({
                error: 'There are no places :('
            })
    } catch (e) {
        next(e)
    }
})

module.exports = router
module.exports.validatePlace = validatePlace
