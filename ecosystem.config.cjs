module.exports = {
  apps: [{
    name: 'moo',
    script: 'npx',
    args: 'tsx server/index.ts',
    cwd: '/var/www/moo',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
