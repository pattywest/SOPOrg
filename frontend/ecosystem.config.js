module.exports = {
  apps: [
    {
      name: 'server_frontend',
      exec_mode: 'fork',
      instances: 'max',
      script: 'sudo ./node_modules/nuxt/bin/nuxt.js',
      args: ' start',
    },
  ],
};
