import { expect, test } from "bun:test"
import { checkHealth, deploy } from "./deploy.js"

test("deploy refuses a dirty local working tree", async () => {
  const calls = []
  const run = async (command, args) => {
    calls.push([command, ...args])
    return { exitCode: 0, stdout: " M data/services.json\n", stderr: "" }
  }

  await expect(deploy({ run, log: () => {} })).rejects.toThrow(
    "Commit or stash local changes before deploying.",
  )
  expect(calls).toEqual([["git", "status", "--porcelain"]])
})

test("deploy validates, publishes, updates the homelab, and checks its health", async () => {
  const calls = []
  const logs = []
  const run = async (command, args) => {
    calls.push([command, ...args])
    if (command === "git" && args[0] === "status") {
      return { exitCode: 0, stdout: "", stderr: "" }
    }
    if (command === "git" && args[0] === "branch") {
      return { exitCode: 0, stdout: "main\n", stderr: "" }
    }
    return { exitCode: 0, stdout: "", stderr: "" }
  }
  const healthCheck = async (baseUrl) => calls.push(["health", baseUrl])

  await deploy({
    run,
    healthCheck,
    log: (message) => logs.push(message),
    env: {
      HOME: "/home/tester",
      DEPLOY_HOST: "homelab",
      DEPLOY_DIR: "/opt/stacks/homepage",
      DEPLOY_URL: "http://192.168.1.3:5000",
    },
  })

  expect(calls.slice(0, 5)).toEqual([
    ["git", "status", "--porcelain"],
    ["git", "branch", "--show-current"],
    ["bun", "test"],
    ["bun", "run", "build"],
    ["git", "push", "origin", "main"],
  ])
  expect(calls[5].slice(0, 5)).toEqual([
    "ssh",
    "-F",
    "/home/tester/.ssh/config",
    "homelab",
    expect.stringContaining("docker compose -f compose.yaml up -d --build --remove-orphans"),
  ])
  expect(calls[6]).toEqual(["health", "http://192.168.1.3:5000"])
  expect(logs.at(-1)).toBe("Deployment complete.")
})

test("health check validates services, calendar, and host metrics", async () => {
  const requests = []
  const fetchImpl = async (url) => {
    requests.push(url)
    if (url.endsWith("/api/stats")) {
      return Response.json({
        services: { running: 3, containers: 5 },
        disks: [{ name: "System", used: 40, total: 250 }],
      })
    }
    return Response.json([{ id: "ok" }])
  }

  await checkHealth("http://homepage.test/", {
    fetchImpl,
    sleep: async () => {},
  })

  expect(requests).toEqual([
    "http://homepage.test/api/services",
    "http://homepage.test/api/calendar",
    "http://homepage.test/api/stats",
  ])
})

test("health check retries while the container starts", async () => {
  let requestCount = 0
  let sleepCount = 0
  const fetchImpl = async (url) => {
    requestCount += 1
    if (requestCount === 1) return new Response("Starting", { status: 503 })
    if (url.endsWith("/api/stats")) {
      return Response.json({
        services: { running: 3, containers: 5 },
        disks: [{ name: "System", used: 40, total: 250 }],
      })
    }
    return Response.json([])
  }

  await checkHealth("http://homepage.test", {
    fetchImpl,
    attempts: 2,
    sleep: async () => {
      sleepCount += 1
    },
  })

  expect(requestCount).toBe(4)
  expect(sleepCount).toBe(1)
})

test("Docker build context excludes local Google credentials", async () => {
  const dockerignore = await Bun.file(".dockerignore").text()
  const patterns = dockerignore.split("\n").map((line) => line.trim())

  expect(patterns).toContain(".env*")
  expect(patterns).toContain("client_secret*.json")
})
