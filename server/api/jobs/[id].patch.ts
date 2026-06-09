import { calculateEstimate } from '../../utils/estimate'
import {prisma} from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

const job = await prisma.job.findUnique({ where: { id } })
  if (!job) throw createError({ statusCode: 404 })

  // If parts are being updated, recalculate estimate
  if (body.parts) {
    body.estimate = calculateEstimate(body.parts)
  }

   return prisma.job.update({
    where: { id },
    data: body,
  })
})




