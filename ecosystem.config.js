module.exports = {
  apps: [{
    name: 'rma-payment',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
