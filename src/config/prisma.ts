import { PrismaClient } from '@prisma/client';

// Khởi tạo một Prisma Client duy nhất để dùng chung cho toàn bộ dự án
const prisma = new PrismaClient();

export default prisma;
