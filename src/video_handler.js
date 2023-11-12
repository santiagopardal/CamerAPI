const fs = require('fs')
const path = require('path')

async function videoPath(fileName, camera, date) {
    const videoPath = `temporal_videos/${camera}/${date}`
    if (!fs.existsSync(videoPath)) {
        await fs.promises.mkdir(videoPath, { recursive: true })
    }
    return path.resolve(`./${videoPath}/${fileName}`)
}

async function getTemporalPartsDir(fileName, camera, date) {
    const videoPath = `temp/${camera}/${date}/${fileName}`
    if (!fs.existsSync(videoPath)) {
        await fs.promises.mkdir(videoPath, { recursive: true })
    }
    return path.resolve(`./${videoPath}`)
}

async function saveFilePart(part, bytes, fileName, camera, date) {
    const dir = await getTemporalPartsDir(fileName, camera, date)
    const partPath = `${dir}/${part}.part`
    await fs.promises.writeFile(partPath, Buffer.from(bytes, 'base64'))

    return dir
}

async function createVideosFromParts(parts, fileName, camera, date) {
    const finalVideoPath = await videoPath(fileName, camera, date)
    return [finalVideoPath, mergeVideos(finalVideoPath, parts, fileName, camera, date)]
}

async function mergeVideos(finalVideoPath, parts, fileName, camera, date) {
    const dir = await getTemporalPartsDir(fileName, camera, date)
    let part = await fs.promises.readFile(`${dir}/0.part`)
    await fs.promises.writeFile(finalVideoPath, part)

    for (let i = 1; i < parts; i++) {
        part = await fs.promises.readFile(`${dir}/${i}.part`)
        await fs.promises.appendFile(finalVideoPath, part)
    }

    removeFolder(dir)

    return finalVideoPath
}

async function removeFolder(path) {
    const files = fs.readdirSync(path)

    files.forEach(
        (filename) => {
            const pth = `${path}/${filename}`
            if (fs.statSync(pth).isDirectory()) {
                removeFolder(pth)
            } else {
                fs.unlinkSync(pth)
            }
        }
    )

    fs.rmdirSync(path)
}

function deleteVideo(path) {
    fs.unlinkSync(path)
}

function getFileSize(path) {
    const file = fs.statSync(path)
    return file.size
}

function createReadStream(path, options) {
    return fs.createReadStream(path, options)
}

module.exports = { saveFilePart, createVideosFromParts, getFileSize, createReadStream, deleteVideo }
