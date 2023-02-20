module.exports = {
  apps: [{
    name:"testsite",
    script: "bin/www",
    watch: ["views", "web", "routes"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules", "client/img"],
  }]
}