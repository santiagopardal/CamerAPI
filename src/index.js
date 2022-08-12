const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.set('json spaces', 2)

const nodes = require('./routes/node')
const cameras = require('./routes/cameras')
const temporal_videos = require('./routes/temporal_videos')
const node_dao = require('./dao/node_dao')

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false, limit: '5mb'}))
app.use(express.json())
app.use(cors())

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

app.use('/api/node/', nodes)
app.use('/api/cameras/', cameras)
app.use('/api/temporal_videos/', temporal_videos)

app.use((req, res, next) => {
    const err = new Error('Url not found');
    err.status = 404;

    next(err);
});

app.use((error, req, res, _) => {
    res.status(error.status || 500).json({ error: error.message });
})

app.listen(8080, () => console.log('Up & running'))
