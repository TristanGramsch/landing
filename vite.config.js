import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

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
            
            // Extract only the latest run of the health check
            // Runs are delimited by: ############ Stack Health Check — <timestamp> ############
            const marker = '############ Stack Health Check';
            const parts = content.split(marker);
            
            let latestRun = '';
            if (parts.length > 1) {
              // Take the last non-empty part and re-prepend the marker
              const lastPart = parts[parts.length - 1].trim();
              if (lastPart) {
                latestRun = marker + lastPart;
              }
            }
            
            // Fallback to full content if parsing fails
            const output = latestRun || content;
            
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(output);
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
