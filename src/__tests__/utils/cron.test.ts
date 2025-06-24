import { msToCron } from "../../utils/cron"

describe('msToCron', () => {
  it('should throw an error if ms is less than 1000', () => {
    expect(() => msToCron(999)).toThrow('Interval must be at least 1000 milliseconds (1 second)')
  })

  it('should return correct cron for 1000 ms (1 sec)', () => {
    expect(msToCron(1000)).toBe('1 0 */1 * * *')
  })

  it('should return correct cron for 1 minute (60000 ms)', () => {
    expect(msToCron(60000)).toBe('0 1 */1 * * *')
  })

  it('should return correct cron for 1 hour (3600000 ms)', () => {
    expect(msToCron(3600000)).toBe('0 0 */1 * * *')
  })

  it('should return correct cron for 2 hours and 30 seconds (7203000 ms)', () => {
    expect(msToCron(7203000)).toBe('3 0 */2 * * *')
  })

  it('should return correct cron for 3 hours, 45 minutes, 20 seconds (13520000 ms)', () => {
    expect(msToCron(13520000)).toBe('20 45 */3 * * *')
  })
})
