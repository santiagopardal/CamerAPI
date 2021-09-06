const { readdirSync } = require('fs');

const VIDEOS_PATH = __dirname.substring(0, __dirname.length - 13) + '/Images'

function VALID_PLACES() {
    return readdirSync(VIDEOS_PATH, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

module.exports = { VIDEOS_PATH, VALID_PLACES }
