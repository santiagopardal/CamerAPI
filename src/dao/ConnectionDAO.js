const { PrismaClient } = require("@prisma/client")
const moment = require("moment");
const prisma = new PrismaClient()


const getLastConnection = async (cameraId) => {
    return prisma.connection.findFirst(
        {
            where: { cameraId: parseInt(cameraId, 10) },
            orderBy: { date: "desc" }
        }
    )
}


const createConnection = async (cameraId, message, date) => {
    return prisma.connection.create(
        {
            data: {
                cameraId: parseInt(cameraId, 10),
                message: message,
                date: moment(date)
            }
        }
    )
}


module.exports = { getLastConnection, createConnection }
