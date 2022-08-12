const router = require('express').Router()
const dao = require('../dao/node_dao')

router.post('/', async (request, response, next) => {
    try {
        let nodeData = {
            ip: request.headers['x-forwarded-for'] || request.socket.remoteAddress,
            port: request.body.port,
        }
        let node = await dao.getNode(nodeData)
        if (!node) {
            let date = new Date()
            nodeData.last_request = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}@${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            await dao.saveNode(nodeData)
            delete nodeData.last_request
            node = await dao.getNode(nodeData)
            response.status(201).json(node)
        } else {
            response.status(200).json(node)
        }
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
