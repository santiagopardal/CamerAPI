const { readdirSync } = require('fs');

VIDEOS_PATH = '../Images'

function VALID_PLACES() {
    return readdirSync(VIDEOS_PATH, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

module.exports = { VIDEOS_PATH, VALID_PLACES }
