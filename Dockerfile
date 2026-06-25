FROM node:22-alpine

WORKDIR /app

# sao chép package.json trước để tận dụng cache
COPY package*.json ./

RUN npm install

# Cài đặt OpenSSL cho Prisma
RUN apk add --no-cache openssl

# Sao chép toàn bộ code còn lại vào container
COPY . .

EXPOSE 3000

# Chạy bằng nodemon để sửa code ngoài máy thì trong docker tự nhận
CMD ["npm", "run", "dev"]