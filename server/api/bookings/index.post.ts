// server/api/bookings/index.post.ts
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // decrement capacity for chosen date
  const availableDate = await prisma.availableDate.findUnique({
    where: { date: body.date },
  })

  if (!availableDate || availableDate.capacity <= 0) {
    throw createError({ statusCode: 400, message: 'No slots available for this date' })
  }

  await prisma.availableDate.update({
    where: { date: body.date },
    data: { capacity: { decrement: 1 } },
  })

  const booking = await prisma.booking.create({
    data: {
      customerName: body.customerName,
      car: body.car,
      date: body.date,
      status: 'PENDING',
    },
    include: { invoiceItems: true },
  })

  return booking
})