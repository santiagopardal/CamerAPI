const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.set('json spaces', 2)

const cameras = require('./routes/cameras')

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false, limit: '5mb'}))
app.use(express.json())
app.use(cors())

app.use('/api/cameras/', cameras)

app.use((req, res, next) => {
    const err = new Error('Url not found');
    err.status = 404;

    next(err);
});

app.use((error, req, res, _) => {
    res.status(error.status || 500).json({ error: error.message });
})

app.listen(8080, () => console.log('Up & running'))
