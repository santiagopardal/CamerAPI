const express = require('express')
const app = express()
const { updateNodeLastRequest } = require('../controllers/NodeController')

app.use(async (request, response, next) => {
    try {
        if (request.headers.node_id) {
            await updateNodeLastRequest(request.headers.node_id, new Date())
        }
        next()
    } catch (e) {
        response.status(401).json({error: `Invalid authentication: ${e.message}`})
    }
})

module.exports = app
