const router = require('express').Router()
const tryCatch = require('../controllers/tryCatch')
const { createNode, getNodeCameras, deleteNode, getNode, getAll, nodeExists } = require('../controllers/NodeController')

router.post('/', tryCatch(
    async (request, response) => {
        let statusCode = 200
        let node
        if (!request.headers.node_id) {
            const nodeData = {
                ip: request.headers['x-forwarded-for'] || request.socket.remoteAddress,
                port: parseInt(request.body.port, 10),
                type: request.body.type
            }
            if (!await nodeExists(nodeData)) {
                node = await createNode(nodeData)
                statusCode = 201
            } else {
                const error = new Error('Node with that data already exists')
                error.status = 400
                throw error
            }
        } else {
            node = await getNode(parseInt(request.headers.node_id))
        }
        response.status(statusCode).json(node)
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
        const node = await getNode(parseInt(request.params.id, 10))
        response.status(200).json(node.toJSON())
    })
)

router.delete('/:id', tryCatch(
    async (request, response) => {
        await deleteNode(request.params.id)
        response.status(200).send()
    })
)

router.get('/:id/cameras', tryCatch(
    async (request, response) => {
        response.status(200).json(await getNodeCameras(request.params.id))
    }
))

router.get('/', tryCatch(
    async (_, response) => {
        response.status(200).json(await getAll())
    })
)

module.exports = router
