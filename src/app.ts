import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: config.app.name,
    version: config.app.version,
    status: 'operational',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'BlitzBatch',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`🚀 ${config.app.name} is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start BlitzBatch:', error);
    process.exit(1);
  }
};

start();