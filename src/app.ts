/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Title: Codders Diary Backend Application
 * Description: It's a blog application.
 * Author: Md Naim Uddin
 * Date: 26/11/2024
 *
 *

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import config from './app/config';
import { globalErrorHandler, notFound } from './app/utils';

const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: [config.client_url as string],
  })
);
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/v1', routes);

//Testing
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send({ message: 'Codders Diary Server Running...' });
});

//global error handler
//@ts-ignore
app.use(globalErrorHandler);

//handle not found
//@ts-ignore
app.use(notFound);

export default app;
