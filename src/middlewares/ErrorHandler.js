const errorHandler = async (error, request, response, next) => {
    response.status(error.status || 500).json({ error: error.message })
}

module.exports = errorHandler
