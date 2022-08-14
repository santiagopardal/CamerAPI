const express = require('express')
const app = express()

app.use(async (request, response, next) => {
    const err = new Error('Url not found')
    err.status = 404
    next(err)
})

app.use(async (error, req, response, _) => {
    response.status(error.status || 500).json({ error: error.message })
})

module.exports = app
