const express = require('express')
const app = express()
const { getNode, update } = require('../controllers/NodeController')

app.use(async (request, response, next) => {
    let updatePromise = null
    try {
        if (request.headers.node_id) {
            const node = await getNode(request.headers.node_id)
            await node.load()
            node.ip = request.socket.remoteAddress
            node.lastRequest = new Date()
            updatePromise = update(node)
        }
        next()
        if (updatePromise) await updatePromise
    } catch (e) {
        if (updatePromise) await updatePromise
        response.status(401).json({error: `Invalid authentication: ${e.message}`})
    }
})

module.exports = app
