import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return prisma.job.create({
    data: {
      customerId: body.customerId,
      vehicleMake: body.vehicleMake ?? body.car,
      vehicleModel: body.vehicleModel ?? '',
      registration: body.registration ?? '',
      status: 'JOB_CARD_CREATED',
    }
  })
})