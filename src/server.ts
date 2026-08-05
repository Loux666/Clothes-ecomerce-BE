import express, { Request, Response } from 'express';
import webRoute from './routes/web';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import cấu hình database để test kết nối khi chạy server
import './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: 'http://localhost:5173', // Cổng Ionic App
    credentials: true // Cho phép gửi kèm Cookie
}));

app.use(cookieParser());

// Gắn các đường dẫn
import apiRoute from './routes/api';
app.use('/', webRoute);
app.use('/api', apiRoute); // Mọi API đều có tiền tố /api, ví dụ: /api/login

app.use(notFoundHandler);
app.use(errorHandler);

// Bật server lên và nghe ở cổng 3000
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});