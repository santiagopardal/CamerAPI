const {create, getConfigurations, update, deleteConfigurations} = require('./dao/camera_configurations_dao')

class CameraConfigurations {
    constructor(camera) {
        this.camera = camera
    }

    setValues({ recording, sensitivity }) {
        this.isRecording = recording
        this.sensitivity = sensitivity
    }

    async load() {
        const configsArray = await getConfigurations([this.camera.id])
        this.setValues(configsArray[0])
    }

    async exists() {
        const configs = await getConfigurations([this.camera.id])
        return configs.length === 1
    }

    async save() {
        let promise
        const exists = await this.exists()
        if (!exists)
            promise = create(this.camera.id, this.toJSON())
        else
            promise = update(this.toJSON())
        await promise
    }

    async delete() {
        await deleteConfigurations(this.camera.id)
    }

    toJSON() {
        return {
            camera: this.camera.id,
            recording: this.isRecording,
            sensitivity: this.sensitivity
        }
    }
}

module.exports = CameraConfigurations
