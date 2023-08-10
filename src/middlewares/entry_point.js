const express = require('express')
const app = express()
const node_dao = require("../dao/node_dao");

app.use(async (request, response, next) => {
    try {
        if (request.headers.node_id) {
            await node_dao.validateNode(request.headers.node_id)
            let date = new Date()
            await node_dao.update({
                id: request.headers.node_id,
                last_request: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}@${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            })
        }
        next()
    } catch (e) {
        response.status(401).json({error: `Invalid authentication: ${e.message}`})
    }
})

module.exports = app
