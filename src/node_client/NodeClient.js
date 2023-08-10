const { Socket } = require('net')

const NODE_PORT = 5460
const NODE_REQUEST_BYTES = 0x4

function toBytes(number) {
    let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let index = 0; index < byteArray.length; index ++ ) {
        let byte = number & 0xff;
        byteArray [ index ] = byte;
        number = (number - byte) / 256 ;
    }

    return new Int8Array(byteArray);
}

function packMessage(arguments) {
    let textEncoder = new TextEncoder()
    let stringifiedArguments = JSON.stringify(arguments)
    let nodeRequest = textEncoder.encode(stringifiedArguments)
    let stringifiedArgumentsSize = toBytes(stringifiedArguments.length)
    let buffer = new ArrayBuffer(9 + stringifiedArguments.length)
    let message = new Int8Array(buffer)

    message[0] = NODE_REQUEST_BYTES
    message.set(stringifiedArgumentsSize, 1)
    for (let i = 0; i < stringifiedArguments.length; i++) {
        message[i + 9] = nodeRequest[i]
    }

    return message
}

async function requestToNode(nodeIp, method, args) {
    let methodArgs = { method: method, args: args}
    return new Promise(
        (resolve, reject) => {
            try {
                let message = packMessage(methodArgs)
                let client = new Socket()
                client.connect({host: nodeIp, port: NODE_PORT}, () => client.write(Buffer.from(message)))
                client.on('data', data => {data = data.subarray(9); resolve(JSON.parse(data));})
                client.on('close', () => console.log('Closed connection'))
                client.on('error', error => reject(error))
            } catch (error) {
                console.log(`Error communicating with node: ${error}`)
                reject(error)
            }
        }
    )
}

module.exports = requestToNode