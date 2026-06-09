import { prisma } from '../../utils/db'

export default defineEventHandler(async () => {
  return prisma.job.findMany()
})