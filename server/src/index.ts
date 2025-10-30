import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount tenant middleware early so routes can access req.tenant
// API namespace
app.use('/api', apiRoutes);

app.get('/', (_req, res) => res.send('Nebula backend running'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Nebula server listening on http://localhost:${PORT}`);
  });
}

export default app;
