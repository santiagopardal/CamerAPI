const router = require('express').Router()
const dao = require('../dao/node_dao')

router.post('/', async (request, response, next) => {
    try {
        await dao.saveNode(request.body)
        response.status(201).json(request.body)
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (request, response, next) => {
    try {
        let result = await dao.validateNode(request.params.id)
        response.status(200).json(result)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (request, response, next) => {
    try {
        await dao.validateNode(request.params.id)
        await dao.deleteNode(request.params.id)
        response.status(200).send()
    } catch (e) {
        next(e)
    }
})

router.get('/', async (_, response, next) => {
    try {
        let result = await dao.getNodes()
        response.status(200).json(result)
    } catch (e) {
        next(e)
    }
})

module.exports = router
