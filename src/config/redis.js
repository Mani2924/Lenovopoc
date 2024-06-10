const { createClient } = require('redis');

const config = require('./vars');

const redisLabclient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    connectTimeout: config.redis.connectTimeout,
  },
});

(async () => {
  try {
    redisLabconnection = await redisLabclient.connect();
    console.info(`REDIS CONNECTED IN LOCAL!`);
  } catch (error) {
    console.error('Error connecting to Redis: ', error);
  }
})();

class RedisDB {
  async isRedisConnected() {
    try {
      this.client = redisLabclient;
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getValueFromRedis(key, type = 1, stRange = 0, endRange = -1) {
    let redisValue = null;
    if ((await this.isRedisConnected()) === true) {
      try {
        if (type === 1) {
          redisValue = await this.client.get(key);
        } else if (type === 2) {
          redisValue = await this.client.mGet(key);
        } else if (type === 3) {
          redisValue = await this.client.hGetAll(key);
        } else if (type === 4) {
          redisValue = await this.client.hGet(key, fieldName);
        } else if (type === 5) {
          redisValue = await this.client.hGet(key, fieldName);
        } else if (type === 6) {
          redisValue = await this.client.lRange(key, 0, -1);
        } else if (type === 7) {
          redisValue = await this.client.sMembers(key);
        } else if (type === 8) {
          redisValue = await this.client.lRange(key, stRange, endRange);
        }
      } catch (err) {
        console.error('ERROR WHILE READING REDIS KEY', err);
        redisValue = null;
      }
    } else {
      console.error('REDIS NOT CONNECTED');
      redisValue = null;
    }
    return redisValue;
  }

  async setValueInRedis(key, value, expire = 86400, type = 1) {
    let isSet = true;
    if ((await this.isRedisConnected()) === true) {
      try {
        if (type === 1) {
          // single value
          await this.client.set(key, value);
        } else if (type === 2) {
          // object - only string/number works = {"name": "Ram", "id": 5, "age": 40, "ojb": '{"a": 1, "b": 2}', "arr": '["1", "2"]', "married": "false"};
          await this.client.hSet(key, value);
        } else if (type === 3) {
          // list
          await this.client.lPush(key, value); //await client.rPush(key, value);
        } else if (type === 4) {
          // set
          await this.client.sAdd(key, value);
        } else if (type === 5) {
          // list
          await this.client.rPush(key, value);
        }

        await this.client.expire(key, expire);
      } catch (err) {
        console.error(
          `ERROR WHILE WRITING REDIS KEY. KEY: ${key}, VALUE: ${value}`,
          err,
        );
        isSet = false;
      }
    } else {
      console.error('REDIS NOT CONNECTED');
      isSet = false;
    }
    return isSet;
  }

  async deleteKeyFromRedis(key) {
    if ((await this.isRedisConnected()) === true) {
      try {
        await redisLabclient.del(key);
      } catch (err) {
        console.error('ERROR WHILE DELETING REDIS KEY', err);
        return false;
      }
    } else {
      console.error('REDIS NOT CONNECTED');
      return false;
    }
    return true;
  }
}

module.exports = RedisDB;
