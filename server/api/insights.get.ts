// server/api/insights.get.ts
import { seasonalFaults, mostCommonFaults } from '../utils/analytics'

export default defineEventHandler(() => {
  const month = new Date().getMonth() + 1

  return {
    seasonal: seasonalFaults(month),
    topFaults: mostCommonFaults(),
  }
})