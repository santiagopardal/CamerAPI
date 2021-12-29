const fs = require('fs')

async function tempDirectory(fileName, camera, date) {
    const path = `temporal_videos/${camera}/${date}`
    if (!fs.existsSync(path)) {
        await fs.promises.mkdir(path, { recursive: true })
    }
    return `${path}/${fileName}`
}

async function saveFilePart(bytes, fileName, camera, date) {
    const dir = await tempDirectory(fileName, camera, date);
    if (!fs.existsSync(dir)) {
        await fs.promises.writeFile(dir, Buffer.from(bytes, 'base64'))
    } else {
        await fs.promises.appendFile(dir, Buffer.from(bytes, 'base64'))
    }
}

module.exports = { saveFilePart }
