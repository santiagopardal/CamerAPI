const { Socket } = require('net')

const NODE_PORT = 5460
const NODE_REQUEST_BYTES = 0x4

function toBytes(number) {
    let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let index = 0; index < byteArray.length; index ++ ) {
        const byte = number & 0xff;
        byteArray [ index ] = byte;
        number = (number - byte) / 256 ;
    }

    return new Int8Array(byteArray);
}

function packMessage(arguments) {
    const textEncoder = new TextEncoder()
    const stringifiedArguments = JSON.stringify(arguments)
    const nodeRequest = textEncoder.encode(stringifiedArguments)
    const stringifiedArgumentsSize = toBytes(stringifiedArguments.length)
    const buffer = new ArrayBuffer(9 + stringifiedArguments.length)
    const message = new Int8Array(buffer)

    message[0] = NODE_REQUEST_BYTES
    message.set(stringifiedArgumentsSize, 1)
    for (let i = 0; i < stringifiedArguments.length; i++) {
        message[i + 9] = nodeRequest[i]
    }

    return message
}

async function requestToNode(nodeIp, method, args) {
    const methodArgs = { method: method, args: args}
    return new Promise(
        (resolve, reject) => {
            try {
                const message = packMessage(methodArgs)
                const client = new Socket()
                client.connect({host: nodeIp, port: NODE_PORT}, () => client.write(Buffer.from(message)))
                client.on('data', data => { data = data.subarray(9); resolve(JSON.parse(data)); })
                client.on('close', () => console.log('Closed connection'))
                client.on('error', error => reject(error))
            } catch (error) {
                reject(error)
            }
        }
    )
}

module.exports = requestToNode