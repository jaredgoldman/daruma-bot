module.exports = {
  apps: [
    {
      name: 'daruma',
      script: 'dist/index.js',
      node_args: '-r dotenv/config',
    },
  ],
};
