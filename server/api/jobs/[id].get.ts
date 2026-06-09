import {prisma} from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  return prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      parts: true,
    },
  })
})