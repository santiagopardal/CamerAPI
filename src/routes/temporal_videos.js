const router = require('express').Router()
const db = require("../database/temporal_video")
const { validateCameraID } = require("../routes/cameras")

router.get('/:camera/', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        let videos = await db.getAllVideos(request.params.camera)
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.get('/:camera/:date', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        let videos = await db.getAllVideosInDate(request.params.camera, request.params.date)
        videos = videos.map(video => video.path)
        response.status(200).json(videos)
    } catch (e) {
        next(e)
    }
})

router.post('/:camera/:date/', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        const video = {
            path: request.query.path,
            date: request.params.date,
            camera: request.params.camera
        }
        await db.logVideo(video)
        response.status(200).json(video)
    } catch (e) {
        next(e)
    }
})

router.delete('/:camera/:date', async (request, response, next) => {
    try {
        await validateCameraID(request.params.camera)
        await db.deleteAllVideosInDate(request.params.camera, request.params.date)
        response.status(200).json({ ok: "OK" })
    } catch (e) {
        next(e)
    }
})

module.exports = router
