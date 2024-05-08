const dao = require('../dao/VideoDAO')
const fs = require('fs')

class Video {
    constructor(id) {
        this.id = id
        this.path = null
        this.date = null
        this.camera = null
        this.node = null
        this.isInNode = null
    }

    async load() {
        const video = await dao.getVideo(this.id)

        if (!video) {
            const error = Error('There is no video with such id')
            error.status = 404
            throw error
        }

        const { path, date, camera, node, is_in_node } = video[0]
        this.path = path
        this.date = date
        this.camera = camera
        this.node = node
        this.isInNode = is_in_node
    }

    getSize() {
        const file = fs.statSync(this.path)
        return file.size
    }

    createReadStream(options) {
        return fs.createReadStream(this.path, options)
    }

    async delete() {
        return new Promise((resolve, reject) => {
            const onFinish = (error) => {
                if (error)
                    reject(error)
                else
                    resolve()
            }
            fs.unlink(this.path, onFinish)
        })
    }
}

module.exports = Video