// server/api/available-dates.get.ts
export default defineEventHandler(() => {
  const today = new Date()
  const dates = []

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    dates.push({
      date: d.toISOString().split('T')[0],
      capacity: 5, // simple constraint
    })
  }

  return dates
})