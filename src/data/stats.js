export function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}d ${hours}h`
}

export function formatBytes(gb) {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`
  return `${gb.toFixed(1)} GB`
}

export function normalizeStats(raw) {
  const disks = raw.disks?.length ? raw.disks : [{ name: "Disk", ...raw.disk }]

  return {
    ...raw,
    cpuPercent: Math.round(raw.cpu),
    ramPercent: Math.round((raw.ram.used / raw.ram.total) * 100),
    diskPercent: Math.round((raw.disk.used / raw.disk.total) * 100),
    disks: disks.map((disk) => ({
      ...disk,
      percent: Math.round((disk.used / disk.total) * 100),
    })),
  }
}
