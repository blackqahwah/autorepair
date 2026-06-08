// server/utils/analytics.ts
import { db } from './store'

export function seasonalFaults(month: number) {
  const map: Record<number, string[]> = {
    12: ['Battery failure', 'Heating issues'],
    1: ['Battery failure', 'Tyre pressure issues'],
    6: ['AC failures', 'Cooling system leaks'],
  }

  return map[month] ?? ['General servicing']
}

export function mostCommonFaults() {
  const faults: Record<string, number> = {}

  db.jobs.forEach(job => {
    (job.parts || []).forEach((p: any) => {
      faults[p.name] = (faults[p.name] || 0) + 1
    })
  })

  return Object.entries(faults)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
}