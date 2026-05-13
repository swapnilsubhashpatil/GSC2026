import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { config } from '@/config';
import healthRouter from '@/routes/health';
import shipmentsRouter from '@/routes/shipments';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
});

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/shipments', shipmentsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Pigeon backend running on port ${config.port}`);
});

export default app;
