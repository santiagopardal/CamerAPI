const express = require('express')
const app = express()
const { getNode, update } = require('../controllers/NodeController')

app.use(async (request, response, next) => {
    try {
        if (request.headers.node_id) {
            const node = await getNode(request.headers.node_id)
            await node.load()
            node.ip = request.socket.remoteAddress
            node.lastRequest = new Date()
            await update(node)
        }
        next()
    } catch (e) {
        response.status(401).json({error: `Invalid authentication: ${e.message}`})
    }
})

module.exports = app
