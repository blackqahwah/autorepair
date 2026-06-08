// server/api/jobs.post.ts
import { db } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const job = {
    id: crypto.randomUUID(),
    bookingId: body.bookingId,
    status: 'JOB_CARD_CREATED',
    technicianNotes: '',
    parts: [],
    estimate: 0,
    invoice: null,
  }

  db.jobs.push(job)
  return job
})