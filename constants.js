const { readdirSync } = require('fs');

VIDEOS_PATH = '/mnt/Shared/Programming/Python/CamerAI/Images'

VALID_PLACES = readdirSync(VIDEOS_PATH, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

module.exports = { VIDEOS_PATH, VALID_PLACES }
