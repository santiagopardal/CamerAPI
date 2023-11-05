const tryCatch = (controller) => async (request, response, next) => {
    try {
        await controller(request, response, next)
    } catch (error) {
        console.error(error)
        next(error)
    }
}

module.exports = tryCatch