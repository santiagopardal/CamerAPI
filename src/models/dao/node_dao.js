const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function getNodes() {
    return prisma.node.findMany()
}

async function getNode(node) {
    return prisma.node.findFirst(
        {
            where: {...node}
        }
    );
}

function deleteNode(id) {
    return prisma.node.deleteMany({where: {id: id}})
}

async function saveNode(node) {
    return prisma.node.create(
        {
            data: { ...node }
        }
    )
}

function update(node) {
    return prisma.node.update(
        {
            where: { id: node.id },
            data: { ...node }
        }
    )
}

module.exports = {
    getNodes,
    getNode,
    deleteNode,
    saveNode,
    update
}
