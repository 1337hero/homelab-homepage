import { expect, test } from "bun:test"
import { getStats } from "./stats.js"

function fakeSystemInformation() {
  return {
    currentLoad: async () => ({ currentLoad: 12.34 }),
    mem: async () => ({ active: 8e9, total: 32e9 }),
    fsSize: async () => ([
      { fs: "/dev/nvme0n1p3", mount: "/hostfs", used: 40e9, size: 250e9 },
      { fs: "/dev/sda1", mount: "/hostfs/mnt/storage", used: 425e9, size: 2e12 },
    ]),
    cpuTemperature: async () => ({ main: 45 }),
    time: async () => ({ uptime: 3600 }),
  }
}

test("stats count running Compose projects and standalone containers", async () => {
  const fetchImpl = async () => Response.json([
    {
      Id: "immich-server",
      Labels: { "com.docker.compose.project": "immich" },
    },
    {
      Id: "immich-database",
      Labels: { "com.docker.compose.project": "immich" },
    },
    { Id: "standalone", Labels: {} },
  ])

  const stats = await getStats({
    systemInformation: fakeSystemInformation(),
    fetchImpl,
    dockerApiUrl: "http://dockerproxy:2375",
    hostFs: "/hostfs",
  })

  expect(stats.services).toEqual({ running: 2, containers: 3 })
})

test("stats report each configured host disk", async () => {
  const stats = await getStats({
    systemInformation: fakeSystemInformation(),
    fetchImpl: async () => Response.json([]),
    dockerApiUrl: "http://dockerproxy:2375",
    hostFs: "/hostfs",
    hostDiskMounts: ["/hostfs", "/hostfs/mnt/storage"],
  })

  expect(stats.disks).toEqual([
    { name: "System", mount: "/", used: 40, total: 250 },
    { name: "Storage", mount: "/mnt/storage", used: 425, total: 2000 },
  ])
})

test("stats remain available when Docker metrics are unavailable", async () => {
  const stats = await getStats({
    systemInformation: fakeSystemInformation(),
    fetchImpl: async () => {
      throw new Error("Docker proxy unavailable")
    },
    dockerApiUrl: "http://dockerproxy:2375",
    hostFs: "/hostfs",
  })

  expect(stats.cpu).toBe(12.3)
  expect(stats.services).toEqual({ running: null, containers: null })
})
