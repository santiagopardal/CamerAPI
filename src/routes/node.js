const router = require('express').Router()
const dao = require('../dao/node_dao')
const tryCatch = require('../controllers/tryCatch')
const Node = require('../models/Node')

router.post('/', tryCatch(
    async (request, response) => {
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
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
        let result = await dao.validateNode(request.params.id)
        response.status(200).json(result)
    })
)

router.delete('/:id', tryCatch(
    async (request, response) => {
        await dao.validateNode(request.params.id)
        await dao.deleteNode(request.params.id)
        response.status(200).send()
    })
)

router.get('/:id/cameras', tryCatch(
    async (request, response) => {
        const node = new Node(request.params.id)
        await node.load()
        response.status(200).json(await node.getCameras())
    }
))

router.get('/', tryCatch(
    async (_, response) => {
        let result = await dao.getNodes()
        response.status(200).json(result)
    })
)

module.exports = router
