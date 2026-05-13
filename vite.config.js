import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

function parseEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const out = {}
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      out[key] = value
    }
    return out
  } catch {
    return {}
  }
}

export default defineConfig({
  server: {
    // Allow reverse proxies / custom domains to set a Host header like `tristan.systems`.
    allowedHosts: ['tristan.systems', 'localhost', '127.0.0.1'],
    middlewareMode: false,
  },
  plugins: [
    {
      name: 'health-log-api',
      configureServer(server) {
        server.middlewares.use('/api/health-log', (req, res, next) => {
          const logPath = path.join(process.env.HOME || '/root', '.local/state/stack-health.log');
          
          try {
            const content = fs.readFileSync(logPath, 'utf8');
            
            const normalized = content.replace(/\r\n?/g, '\n');

            // Extract only the latest run of the health check
            // Each run starts with: ############ Stack Health Check ... ############
            // and ends with:   ############ END ############
            const lines = normalized.split('\n');

            let startIdx = -1;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('############ Stack Health Check')) {
                startIdx = i;
              }
            }

            let latestRun = '';
            if (startIdx !== -1) {
              let endIdx = -1;
              for (let j = startIdx; j < lines.length; j++) {
                if (lines[j].includes('############ END ############')) {
                  endIdx = j;
                  break;
                }
              }

              if (endIdx !== -1) {
                latestRun = lines.slice(startIdx, endIdx + 1).join('\n');
              }
            }

            // Fallback to full content if parsing fails
            let output = latestRun || normalized;

            // Strip ANSI escape sequences (color/control codes) so the log
            // renders cleanly in the browser (no "unclosed brackets").
            output = output
              .replace(/\u001b\[[0-9;]*m/g, '') // SGR
              .replace(/\u001b\[[0-9;]*K/g, '') // Erase in line
              .replace(/\u001b\][^\u0007]*\u0007/g, ''); // OSC

            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(output.endsWith('\n') ? output : `${output}\n`);
          } catch (error) {
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 404;
            res.end('Health log not found. Diagnose has not run yet.');
          }
        });
      },
    },

  ],
})
