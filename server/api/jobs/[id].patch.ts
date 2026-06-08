// server/api/jobs/[id].patch.ts
import { db } from '../../utils/store'
import { calculateEstimate } from '../../utils/estimate'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const job = db.jobs.find(j => j.id === id)
  if (!job) throw createError({ statusCode: 404 })

  // If parts are being updated, recalculate estimate
  if (body.parts) {
    body.estimate = calculateEstimate(body.parts)
  }

  Object.assign(job, body)

  return job
})