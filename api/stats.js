import si from "systeminformation"

const HOST_FS = process.env.HOST_FS

export async function getStats() {
  const [cpu, mem, disk, temp, time] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.cpuTemperature(),
    si.time(),
  ])

  const root = HOST_FS
    ? disk.find((d) => d.mount === HOST_FS) || disk[0]
    : disk.find((d) => d.mount === "/") || disk[0]

  return {
    cpu: Math.round(cpu.currentLoad * 10) / 10,
    ram: {
      used: Math.round((mem.active / 1e9) * 10) / 10,
      total: Math.round((mem.total / 1e9) * 10) / 10,
    },
    disk: {
      used: Math.round((root.used / 1e9) * 10) / 10,
      total: Math.round((root.size / 1e9) * 10) / 10,
    },
    temp: temp.main ?? 0,
    uptime: time.uptime,
  }
}
