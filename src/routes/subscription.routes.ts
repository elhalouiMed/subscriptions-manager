import { Express, Request, Response } from 'express';
import { config } from '../config';

export const registerRoutes = (app: Express) => {
  app.get('/', (req: Request, res: Response) => {
    res.json({ project: config.PROJECT_NAME });
  });
};
