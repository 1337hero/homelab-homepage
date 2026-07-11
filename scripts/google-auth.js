const DEFAULT_REDIRECT_URI = "http://127.0.0.1:8085"
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly"
const UPDATE_ENV = process.argv.includes("--update-env")

function getEnvOrPrompt(name, promptText) {
  const value = process.env[name]
  if (value) return value

  const input = prompt(promptText)
  return input?.trim() || ""
}

async function openBrowser(url) {
  try {
    const proc = Bun.spawn(["xdg-open", url], {
      stdin: "ignore",
      stdout: "ignore",
      stderr: "ignore",
    })
    const code = await proc.exited
    return code === 0
  } catch {
    return false
  }
}

async function exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri }) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  })

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed (${res.status}): ${text}`)
  }

  return res.json()
}

async function updateRefreshToken(refreshToken) {
  const envPath = ".env"
  const envFile = Bun.file(envPath)
  const current = await envFile.exists() ? await envFile.text() : ""
  const setting = `GOOGLE_REFRESH_TOKEN=${refreshToken}`
  const updated = /^GOOGLE_REFRESH_TOKEN=.*$/m.test(current)
    ? current.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, setting)
    : `${current}${current && !current.endsWith("\n") ? "\n" : ""}${setting}\n`

  await Bun.write(envPath, updated)
}

async function run() {
  const clientId = getEnvOrPrompt("GOOGLE_CLIENT_ID", "Enter GOOGLE_CLIENT_ID: ")
  const clientSecret = getEnvOrPrompt("GOOGLE_CLIENT_SECRET", "Enter GOOGLE_CLIENT_SECRET: ")
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || DEFAULT_REDIRECT_URI

  if (!clientId || !clientSecret) {
    console.error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.")
    process.exit(1)
  }

  const redirect = new URL(redirectUri)
  const state = crypto.randomUUID()

  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`

  console.log("Starting OAuth callback server...")

  const tokenPromise = new Promise((resolve, reject) => {
    const server = Bun.serve({
      port: Number(redirect.port) || 80,
      async fetch(req) {
        const reqUrl = new URL(req.url)

        if (reqUrl.pathname !== redirect.pathname) {
          return new Response("Not Found", { status: 404 })
        }

        const reqState = reqUrl.searchParams.get("state")
        if (reqState !== state) {
          reject(new Error("OAuth callback state mismatch."))
          server.stop(true)
          return new Response("Invalid state. You can close this tab.", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          })
        }

        const code = reqUrl.searchParams.get("code")
        const error = reqUrl.searchParams.get("error")

        if (error) {
          reject(new Error(`OAuth authorization failed: ${error}`))
          server.stop(true)
          return new Response(`Authorization failed: ${error}. You can close this tab.`, {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          })
        }

        if (!code) {
          reject(new Error("OAuth callback missing code parameter."))
          server.stop(true)
          return new Response("Missing code. You can close this tab.", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          })
        }

        try {
          const tokens = await exchangeCodeForTokens({
            code,
            clientId,
            clientSecret,
            redirectUri,
          })
          resolve(tokens)
          return new Response("Authorization complete. You can close this tab.", {
            headers: { "Content-Type": "text/plain" },
          })
        } catch (err) {
          reject(err)
          return new Response("Token exchange failed. Check terminal output.", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          })
        } finally {
          server.stop(true)
        }
      },
    })
  })

  const opened = await openBrowser(authUrl)
  if (!opened) {
    console.log("Open this URL in your browser:")
  }
  console.log(authUrl)

  const tokens = await tokenPromise

  if (!tokens.refresh_token) {
    console.error("No refresh_token returned. Re-run and ensure prompt=consent + access_type=offline are used.")
    process.exit(1)
  }

  if (UPDATE_ENV) {
    await updateRefreshToken(tokens.refresh_token)
    console.log("Refresh token saved to .env.")
    return
  }

  console.log("\nRefresh token obtained. Add this value to GOOGLE_REFRESH_TOKEN in .env:\n")
  console.log(tokens.refresh_token)
}

run().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
