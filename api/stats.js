import si from "systeminformation"

const HOST_FS = process.env.HOST_FS
const HOST_DISK_MOUNTS = (process.env.HOST_DISK_MOUNTS || (HOST_FS
  ? HOST_FS
  : "/,/mnt/storage"))
  .split(",")
  .map((mount) => mount.trim())
  .filter(Boolean)
const DOCKER_API_URL = process.env.DOCKER_API_URL

function roundGb(bytes) {
  return Math.round((bytes / 1e9) * 10) / 10
}

function diskName(mount, index) {
  if (index === 0) return "System"
  const name = mount.split("/").filter(Boolean).at(-1) || `Disk ${index + 1}`
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function summarizeContainers(containers) {
  const applications = new Set(containers.map((container) => (
    container.project
      || container.Labels?.["com.docker.compose.project"]
      || `container:${container.Id}`
  )))

  return { running: applications.size, containers: containers.length }
}

async function getDockerStats(dockerApiUrl, fetchImpl) {
  if (!dockerApiUrl) return { running: null, containers: null }

  const response = await fetchImpl(`${dockerApiUrl}/containers/json`)
  if (!response.ok) throw new Error(`Docker API returned HTTP ${response.status}`)

  const containers = await response.json()
  return summarizeContainers(containers)
}

export async function getStats({
  systemInformation = si,
  fetchImpl = fetch,
  dockerApiUrl = DOCKER_API_URL,
  hostFs = HOST_FS,
  hostDiskMounts = HOST_DISK_MOUNTS,
} = {}) {
  const [cpu, mem, disk, temp, time, services] = await Promise.all([
    systemInformation.currentLoad(),
    systemInformation.mem(),
    systemInformation.fsSize(),
    systemInformation.cpuTemperature(),
    systemInformation.time(),
    getDockerStats(dockerApiUrl, fetchImpl).catch(() => ({
      running: null,
      containers: null,
    })),
  ])

  const root = hostFs
    ? disk.find((d) => d.mount === hostFs) || disk[0]
    : disk.find((d) => d.mount === "/") || disk[0]
  const disks = hostDiskMounts
    .map((mount, index) => {
      const filesystem = disk.find((entry) => entry.mount === mount)
      if (!filesystem) return null

      const visibleMount = hostFs && mount.startsWith(hostFs)
        ? mount.slice(hostFs.length) || "/"
        : mount
      return {
        name: diskName(mount, index),
        mount: visibleMount,
        used: roundGb(filesystem.used),
        total: roundGb(filesystem.size),
      }
    })
    .filter(Boolean)

  return {
    cpu: Math.round(cpu.currentLoad * 10) / 10,
    ram: {
      used: Math.round((mem.active / 1e9) * 10) / 10,
      total: Math.round((mem.total / 1e9) * 10) / 10,
    },
    disk: {
      used: roundGb(root.used),
      total: roundGb(root.size),
    },
    disks,
    temp: temp.main ?? 0,
    uptime: time.uptime,
    services,
  }
}
