import Redis from 'ioredis';

class RedisSingleton {
  private redis;
  constructor() {
    
    this.redis = new Redis({
      host: "localhost",
      port: 6379
    });
    console.log(`Redis Singleton Created!`)
  }

  getClient() {
    console.log(`Retrieving Redis Client...`)
 
    return this.redis;
  }
  
}

const redis = new RedisSingleton().getClient();

export { redis }