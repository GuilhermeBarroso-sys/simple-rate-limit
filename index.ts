import express, { NextFunction, Request, Response } from "express";
import { redis } from "./redis";

type IpRecordKeys = "ip" | "rate" | "time"
const app = express();
app.use(express.json());

const REQUESTS_ALLOWED_PER_MINUTE = 100; 

const rateLimitMiddleware = async (request : Request, response : Response, next: NextFunction) => {

  const userIp = request.ip;
  console.log(`[DEBUG] userIp: ${userIp}`)
  if(!userIp) {
    return next();
  }
  const key = `rateLimit:${userIp}`
  const ipExists = await redis.hexists(key, "ip")
  if(!ipExists) {
    await redis.hset(key, {
      "ip": userIp!,
      "rate": 1,
      "time": new Date().getTime()
    })
    await redis.expire(key, 60 * 5)
    return next();
  } 
  const ipRecord = await redis.hgetall(key) as Record<IpRecordKeys, string>;
  const minuteDifference = new Date().getTime() - Number(ipRecord.time)

  const MINUTE_IN_MILLISECONDS = 60000
  if(minuteDifference < MINUTE_IN_MILLISECONDS) {
    if(parseInt(ipRecord.rate) > REQUESTS_ALLOWED_PER_MINUTE) {
      console.log(`[${new Date().toISOString()}] Too Many Requests, You sent ${ipRecord.rate} requests in less than a minute!`)
      response.status(429).json(`Too Many Requests, You sent ${ipRecord.rate} requests in less than a minute!`)
      return;
    }
    await redis.hincrby(key, "rate", 1);

  } else {
    await redis.hset(key, 'rate', 1)
    await redis.hset(key, 'time', new Date().getTime())
  }

  return next();
}
app.use(rateLimitMiddleware)
app.get("/ping", (request, response) => {
  console.log(`ping`)
  response.send("ok")
})
app.listen(3000, async () => {  
  console.log(`Server started`)
})
