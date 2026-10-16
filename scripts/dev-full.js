import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const build = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
  cwd: root,
  stdio: 'inherit',
  windowsHide: true,
})

const buildExitCode = await new Promise((resolveExitCode) => {
  build.on('error', (error) => {
    console.error('Frontend build failed to start:', error.message)
    resolveExitCode(1)
  })
  build.on('exit', (code) => resolveExitCode(code ?? 1))
})

if (buildExitCode !== 0) {
  process.exitCode = buildExitCode
} else {
  const backend = spawn('dotnet', [
  'run',
  '--project',
  'backend/SmartStock.API.csproj',
  '--launch-profile',
  'http',
  ], {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  })

  backend.on('error', (error) => {
    console.error('Backend failed to start:', error.message)
    process.exitCode = 1
  })
  backend.on('exit', (code) => {
    process.exitCode = code ?? 1
  })

  process.on('SIGINT', () => backend.kill())
  process.on('SIGTERM', () => backend.kill())
}
