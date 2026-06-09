// server/api/available-dates.get.ts
import { prisma } from '../utils/db'

export default defineEventHandler(async () => {
  // seed dates if none exist
  const count = await prisma.availableDate.count()
  if (count === 0) {
    const today = new Date()
    const data = []
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      data.push({ date: d.toISOString().split('T')[0], capacity: 5 })
    }
    await prisma.availableDate.createMany({ data })
  }

  return prisma.availableDate.findMany({
    where: { capacity: { gt: 0 } },
    orderBy: { date: 'asc' },
  })
})