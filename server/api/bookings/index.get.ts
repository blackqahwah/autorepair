// server/api/bookings/index.get.ts
import { prisma } from '../../utils/db'

export default defineEventHandler(async () => {
  return prisma.booking.findMany({
    include: { invoiceItems: true },
    orderBy: { createdAt: 'desc' },
  })
})