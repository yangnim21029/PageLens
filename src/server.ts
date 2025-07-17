import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Import new consolidated routes
import { createAppRoutes } from './routes/appRoutes';
import { AuditPipelineOrchestrator } from './app/audit-pipeline.orchestrator';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for frontend assets


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Instantiate orchestrator
const auditOrchestrator = new AuditPipelineOrchestrator();

// API Routes - Use the new consolidated appRoutes
app.use('/api', createAppRoutes(auditOrchestrator));


// Serve the frontend demo


// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PageLens SEO Analysis Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: {
        audit: '/api/audit',
        batchAudit: '/api/audit/batch',
        stats: '/api/stats'
      }
    },
    
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  console.log(`🔍 API endpoints at: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;