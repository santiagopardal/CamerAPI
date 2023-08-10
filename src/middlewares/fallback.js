const express = require('express')
const app = express()

app.use(async (request, response, next) => {
    const err = new Error('Url not found')
    err.status = 404
    next(err)
})

module.exports = app
