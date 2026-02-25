function jitter(base, range) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * range))
}

let cpuBase = 23
let ramUsed = 12.4

export function getMockStats() {
  cpuBase = jitter(cpuBase, 8)
  ramUsed = jitter(ramUsed, 0.6)

  return {
    cpu: Math.round(cpuBase * 10) / 10,
    ram: { used: Math.round(ramUsed * 10) / 10, total: 32 },
    disk: { used: 847, total: 2000 },
    uptime: 1296000 + Math.floor(Date.now() / 1000) % 86400,
    temp: Math.round(jitter(52, 4)),
    network: {
      up: Math.round(Math.random() * 50 * 10) / 10,
      down: Math.round(Math.random() * 200 * 10) / 10,
    },
  }
}

export function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}d ${hours}h`
}

export function formatBytes(gb) {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`
  return `${gb.toFixed(1)} GB`
}
