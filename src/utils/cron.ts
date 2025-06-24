export const msToCron = (ms: number): string => {
  const secondsTotal = Math.floor(ms / 1000)

  if (secondsTotal < 1) {
    throw new Error('Interval must be at least 1000 milliseconds (1 second)')
  }

  const sec = secondsTotal % 60
  const totalMinutes = Math.floor(secondsTotal / 60)
  const min = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  return `${sec} ${min} */${Math.max(hours, 1)} * * *`
}