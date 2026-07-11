function shellQuote(value) {
  return `'${String(value).replaceAll("'", `'"'"'`)}'`
}

async function runCommand(command, args) {
  const process = Bun.spawn([command, ...args], {
    stdin: "inherit",
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ])
  return { exitCode, stdout, stderr }
}

async function checkHealth(baseUrl, {
  fetchImpl = fetch,
  attempts = 10,
  sleep = Bun.sleep,
} = {}) {
  const root = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      for (const endpoint of ["api/services", "api/calendar"]) {
        const url = new URL(endpoint, root).toString()
        const response = await fetchImpl(url)
        if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`)

        const data = await response.json()
        if (!Array.isArray(data)) throw new Error(`${url} returned an unexpected response.`)
      }
      return
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(1000)
    }
  }

  throw lastError
}

async function runStep(run, command, args, label) {
  const result = await run(command, args)

  if (result.exitCode !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim()
    throw new Error(detail ? `${label} failed:\n${detail}` : `${label} failed.`)
  }

  return result.stdout.trim()
}

async function deploy({
  run = runCommand,
  healthCheck = checkHealth,
  log = console.log,
  env = process.env,
} = {}) {
  const status = await run("git", ["status", "--porcelain"])

  if (status.exitCode !== 0) {
    throw new Error(status.stderr || "Could not inspect the local working tree.")
  }

  if (status.stdout.trim()) {
    throw new Error("Commit or stash local changes before deploying.")
  }

  log("Local working tree is clean.")

  const branch = await runStep(
    run,
    "git",
    ["branch", "--show-current"],
    "Branch detection",
  )
  if (!branch) throw new Error("Deploy from a branch, not a detached HEAD.")

  const host = env.DEPLOY_HOST || "homelab"
  const remoteDir = env.DEPLOY_DIR || "/opt/stacks/homepage"
  const baseUrl = env.DEPLOY_URL || "http://192.168.1.3:5000"
  const sshConfig = env.DEPLOY_SSH_CONFIG || `${env.HOME}/.ssh/config`

  log("Running tests...")
  await runStep(run, "bun", ["test"], "Tests")
  log("Building production assets...")
  await runStep(run, "bun", ["run", "build"], "Build")
  log(`Pushing ${branch}...`)
  await runStep(run, "git", ["push", "origin", branch], "Push")

  const remoteCommand = [
    "set -eu",
    `cd ${shellQuote(remoteDir)}`,
    'if [ -n "$(git status --porcelain)" ]; then',
    '  echo "Remote working tree is dirty. Reconcile it before deploying." >&2',
    "  git status --short >&2",
    "  exit 1",
    "fi",
    `git fetch origin ${shellQuote(branch)}`,
    `git merge --ff-only ${shellQuote(`origin/${branch}`)}`,
    "docker compose -f compose.yaml up -d --build --remove-orphans",
  ].join("\n")

  log(`Updating ${host}...`)
  await runStep(
    run,
    "ssh",
    ["-F", sshConfig, host, remoteCommand],
    "Remote deployment",
  )
  log("Checking live APIs...")
  await healthCheck(baseUrl)
  log("Deployment complete.")
}

if (import.meta.main) {
  deploy().catch((error) => {
    console.error(`Deploy failed: ${error.message || error}`)
    process.exitCode = 1
  })
}

export { checkHealth, deploy }
