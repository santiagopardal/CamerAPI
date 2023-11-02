const router = require('express').Router()
const dao = require('../dao/node_dao')
const tryCatch = require('../controllers/tryCatch')
const { createNode, getNodeCameras, deleteNode, getNode, getAll, nodeExists } = require('../logic/node')

router.post('/', tryCatch(
    async (request, response) => {
        let statusCode = 200
        let node
        if (!request.headers.node_id) {
            const nodeData = {
                ip: request.headers['x-forwarded-for'] || request.socket.remoteAddress,
                port: request.body.port,
            }
            if (!nodeExists(nodeData)) {
                node = await createNode(nodeData)
                statusCode = 201
            }
        } else {
            node = await getNode(parseInt(request.headers.node_id))
        }
        response.status(statusCode).json(node)
    })
)

router.get('/:id', tryCatch(
    async (request, response) => {
        const node = await getNode(request.params.id)
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
