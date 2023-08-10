const SQLITE_CONSTRAINT = 'SQLITE_CONSTRAINT'

function handleError(error, messages) {
    switch (error.code) {
        case SQLITE_CONSTRAINT:
            error = {
                message: messages[SQLITE_CONSTRAINT],
                status: 409
            }
            break
        default:
            error = {
                message: 'Server side error',
                status: 500
            }
    }

    return error
}

module.exports = {
    SQLITE_CONSTRAINT,
    handleError
}