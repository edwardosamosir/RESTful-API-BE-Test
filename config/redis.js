const Redis = require("ioredis");

const redis = new Redis({
  port: 12470,
  host: "redis-12470.c295.ap-southeast-1-1.ec2.cloud.redislabs.com",
  username: "default", 
  password: "wAzzE9hGYurC1w4iGjPpHeDDLWjIoee0",
  db: 0, 
});

module.exports = redis