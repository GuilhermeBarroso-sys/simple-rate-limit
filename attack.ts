import axios from 'axios';

async function simulateAttack({
  url = 'http://localhost:3000/ping',
  concurrency = 50,
  totalRequests = 10000,
  rampUpSeconds = 5
}) {
  let completedRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  
  const startTime = Date.now();
  const requestsPerBatch = Math.ceil(totalRequests / rampUpSeconds);
  
  console.log(`Starting attack simulation against ${url}`);
  console.log(`- Total requests: ${totalRequests}`);
  console.log(`- Concurrency: ${concurrency}`);
  console.log(`- Ramp-up time: ${rampUpSeconds}s`);
  
  async function sendRequest() {
    try {
      await axios.get(url);
      successfulRequests++;
    } catch (error) {
      failedRequests++;
  
    } finally {
      completedRequests++;
    }
  }
  
  async function sendBatch(batchSize : any) {
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(sendRequest());
      if (batch.length >= concurrency) {
        await Promise.all(batch);
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  }
  
  for (let second = 0; second < rampUpSeconds; second++) {
    await sendBatch(requestsPerBatch);
    console.log(`Batch ${second + 1}/${rampUpSeconds} completed`);
  }
  
  const duration = (Date.now() - startTime) / 1000;
  console.log(`\nAttack simulation completed:`);
  console.log(`- Duration: ${duration.toFixed(2)}s`);
  console.log(`- Requests per second: ${(completedRequests / duration).toFixed(2)}`);
  console.log(`- Success rate: ${((successfulRequests / completedRequests) * 100).toFixed(2)}%`);
}

async function main () {
    await simulateAttack({
      totalRequests: 1000,
      concurrency: 50
    });
    console.log(`Sleep...`)
  
  
}

main()