const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.set("json spaces", 2)

// Routes
const places = require('./routes/places')

// Middlewares
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

app.use('/api/places/', places)

app.use((req, res, next) => {
    const err = new Error("Url not found");
    err.status = 404;

    next(err);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({ error: error.message });
})

app.listen(8080, () => console.log('Up & running'))
