// server/api/bookings.post.ts
import { db } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const booking = {
    id: crypto.randomUUID(),
    customerName: body.customerName,
    car: body.car,
    date: body.date,
    status: 'BOOKED',
  }

  db.bookings.push(booking)

  const job = {
    id: crypto.randomUUID(),
    bookingId: booking.id,
    customerName: booking.customerName,
    car: booking.car,
    date: booking.date,
    status: 'JOB_CARD_CREATED',
    technicianNotes: '',
    parts: [],
    estimate: 0,
    invoice: null,
  }

  db.jobs.push(job)

  return booking
})