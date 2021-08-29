const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const places = require('./places')
const { _, validatePlace } = places
require('../constants')

function transformDate(date) {
    var date = moment(date, 'DD-MM-YYYY', true)

    if (!date.isValid()) {
        const error = Error('Date is invalid')
        error.status = 400

        throw error
    }
    return date.format('YYYY-MM-DD')
}

router.get('/:place/:date', (request, response, next) => {
    try {
        validatePlace(request.params.place)
        const date = transformDate(request.params.date)
        
        const pth = path.join(VIDEOS_PATH, request.params.place, `${date}.mp4`)

        if (!fs.existsSync(pth)) {
            console.log(date)
            const error = Error("Date not found")
            error.status = 404

            throw error
        }

        response.download(pth)
    } catch (e) {
        next(e)
    }
})

module.exports = router
