const fs = require('fs')
const path = require('path')

async function videoPath(fileName, camera, date) {
    const videoPath = `temporal_videos/${camera}/${date}`
    if (!fs.existsSync(videoPath)) {
        await fs.promises.mkdir(videoPath, { recursive: true })
    }
    return path.resolve(`./${videoPath}/${fileName}`)
}

async function saveFilePart(bytes, fileName, camera, date) {
    const dir = await videoPath(fileName, camera, date);
    if (!fs.existsSync(dir)) {
        await fs.promises.writeFile(dir, Buffer.from(bytes, 'base64'))
    } else {
        await fs.promises.appendFile(dir, Buffer.from(bytes, 'base64'))
    }

    return dir
}

module.exports = { saveFilePart }
