const Promise = require('bluebird');
const redis = require('redis');
const config = require('ocbesbn-config');

let subscriber;
const initRedisConfig = () => new Promise((resolve, reject) => {
  config.init({})
    .then((config) => Promise.all([config.getEndPoint('redis'), config.get('redis-auth')]))
    .then(([redisConfig, redisAuth = process.env.REDIS_AUTH]) => {
      subscriber = redis.createClient(redisConfig.port, redisConfig.host);
      subscriber.auth(redisAuth, (error) => {
        if (error) reject(error);

        resolve();
      });
    })
});

exports.initRedisConfig = initRedisConfig;
exports.getSubscriber = () => {
  if (!subscriber) {
    return initRedisConfig().then(() => subscriber)
  }

  return Promise.resolve(subscriber);
};