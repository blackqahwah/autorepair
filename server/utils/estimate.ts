export function calculateEstimate(parts: any[]) {
  const laborRate = 80

  const partsCost = parts.reduce((sum, p) => sum + p.price, 0)
  const laborHours = parts.length * 1.5

  return partsCost + laborHours * laborRate
}