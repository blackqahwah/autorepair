// server/api/bookings/[id].patch.ts
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // handle accept/decline
  if (body.status) {
    return prisma.booking.update({
      where: { id },
      data: { status: body.status },
      include: { invoiceItems: true },
    })
  }

  // handle invoice submission from admin
  if (body.invoiceItems) {
    const total = body.invoiceItems.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )

    // delete old items then recreate
    await prisma.invoiceItem.deleteMany({ where: { bookingId: id } })

    return prisma.booking.update({
      where: { id },
      data: {
        invoiceTotal: total,
        invoiceItems: {
          create: body.invoiceItems.map((item: { name: string; price: number; quantity: number }) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { invoiceItems: true },
    })
  }

  // handle payment
  if (body.paymentStatus) {
    return prisma.booking.update({
      where: { id },
      data: {
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod ?? undefined,
      },
      include: { invoiceItems: true },
    })
  }
})