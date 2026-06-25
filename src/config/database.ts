import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'express_hotel',
    waitForConnections: true,
    connectionLimit: 10,  // Số lượng kết nối tối đa trong pool
    queueLimit: 0
});

// Test thử kết nối khi khởi động
pool.getConnection()
    .then((connection) => {
        console.log('✅ Đã kết nối thành công tới database MySQL bằng Connection Pool!');
        connection.release(); // Nhớ trả connection lại cho pool sau khi dùng xong
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối tới database:', err.message);
    });

export default pool;
