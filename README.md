# Redis Rate Limiting Middleware

A simple yet effective Express middleware for rate limiting API requests using Redis as a storage backend. This middleware tracks and limits the number of requests from each IP address within a specified time window.

## Features

- IP-based request tracking
- Configurable request limits per minute
- Redis-backed storage for distributed environments
- Sliding window approach for accurate rate limiting
- TypeScript implementation for type safety

## How It Works

The middleware uses Redis hash sets to store information about each client's requests:

1. When a request comes in, the client's IP address is extracted
2. The middleware checks if this IP exists in Redis
3. If not, a new record is created with initial count = 1
4. If it exists, the middleware checks if the request limit has been exceeded within the time window
5. If the limit is exceeded, the request is rejected with a 429 status code
6. Otherwise, the request counter is incremented and the request proceeds

### Redis Implementation

The middleware uses Redis hash sets with the following structure:

```
key: rateLimit:{IP_ADDRESS}
fields:
  - ip: The client's IP address
  - rate: Number of requests in the current time window
  - time: Timestamp of the first request in the current window
```

Each key has an expiration time of 5 minutes to automatically clean up old records.

## Prerequisites

- Node.js (v14 or higher)
- Redis server (v5 or higher)
- TypeScript

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/simple-rate-limit.git
   cd simple-rate-limit
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make sure Redis is running on localhost:6379 (or update the connection settings in `redis.ts`)

## Usage

### Basic Usage

The middleware is already configured in the `index.ts` file. To use it in your own Express application:

```typescript
import express from 'express';
import { rateLimitMiddleware } from './path-to-middleware';

const app = express();

// Apply the middleware globally
app.use(rateLimitMiddleware);

// Or apply it to specific routes
app.get('/api/sensitive-endpoint', rateLimitMiddleware, (req, res) => {
  // Your route handler
});
```

### Configuration

You can modify the `REQUESTS_ALLOWED_PER_MINUTE` constant in `index.ts` to adjust the rate limit:

```typescript
const REQUESTS_ALLOWED_PER_MINUTE = 100; // Change this value as needed
```

## Testing the Rate Limiter

The project includes an `attack.ts` script that simulates a high volume of concurrent requests to test the rate limiting functionality.

To run the test:

```
npm run dev  # Start the server in one terminal
```

Then in another terminal:

```
ts-node attack.ts  # Run the attack simulation
```

### Attack Simulation Parameters

You can customize the attack simulation by modifying the parameters in `attack.ts`:

```typescript
await simulateAttack({
  url: 'http://localhost:3000/ping',  // Target endpoint
  concurrency: 50,                    // Concurrent requests
  totalRequests: 1000,                // Total number of requests
  rampUpSeconds: 5                    // Time period to distribute requests
});
```

## Performance Considerations

- The middleware uses a Redis singleton pattern to maintain a single connection
- Redis operations are asynchronous to prevent blocking the event loop
- Keys are automatically expired to prevent memory leaks
- The middleware uses a sliding window approach for more accurate rate limiting

## Potential Improvements

- Add support for different rate limits per route
- Implement token bucket algorithm for more flexible rate limiting
- Add support for custom response messages
- Implement IP whitelisting for trusted clients
- Add distributed locking for high-concurrency environments

## License

ISC
