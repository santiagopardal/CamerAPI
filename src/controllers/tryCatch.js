const tryCatch = (controller) => async (request, response, next) => {
    try {
        controller(request, response)
    } catch (error) {
        next(error)
    }
}

module.exports = tryCatch