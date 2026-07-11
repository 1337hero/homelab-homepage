import { expect, test } from "bun:test"
import { normalizeStats } from "./stats.js"

test("stats normalization calculates utilization for every disk", () => {
  const stats = normalizeStats({
    cpu: 12.6,
    ram: { used: 8, total: 32 },
    disk: { used: 40, total: 250 },
    disks: [
      { name: "System", used: 40, total: 250 },
      { name: "Storage", used: 400, total: 2000 },
    ],
  })

  expect(stats.cpuPercent).toBe(13)
  expect(stats.ramPercent).toBe(25)
  expect(stats.disks.map((disk) => disk.percent)).toEqual([16, 20])
})
