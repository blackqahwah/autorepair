import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { invoiceItems: true },
  })

  if (!booking) throw createError({ statusCode: 404 })

  return booking
})