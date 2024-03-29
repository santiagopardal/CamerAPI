const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.set('json spaces', 2)

const entry_point_middleware = require('./middlewares/EntryPoint')
const nodes = require('./routes/node')
const cameras = require('./routes/cameras')
const temporal_videos = require('./routes/temporal_videos')
const fallback = require('./middlewares/Fallback')
const errorHandler = require('./middlewares/ErrorHandler')

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false, limit: '5mb'}))
app.use(express.json())
app.use(cors())

app.use('/', entry_point_middleware)
app.use('/api/node/', nodes)
app.use('/api/cameras/', cameras)
app.use('/api/temporal_videos/', temporal_videos)
app.use('/', fallback)
app.use(errorHandler)

app.listen(8080, () => console.log('Up & running'))
