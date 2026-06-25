import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../utils/mailer';

interface updateUserDto {
    name: string;
    email: string;
    password: string;
    phone: string;
    usertype: string;
}

export const loginUser = async (email: string, password: string) => {
    // 1. Tìm user trong bảng 'users' (vừa kéo từ DB về)
    const user = await prisma.users.findUnique({
        where: { email: email }
    });

    if (!user) {
        throw new Error('Email không tồn tại trong hệ thống');
    }

    if (!user.email_verified_at) {
        // Sinh OTP mới nếu chưa verify
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        await prisma.users.update({
            where: { id: user.id },
            data: { otp_code: otp, otp_expires_at: expiresAt }
        });

        // Gửi email thật qua Nodemailer
        await sendOtpEmail(email, otp);

        const err: any = new Error('Vui lòng xác thực OTP');
        err.status = 403;
        throw err;
    }

    // 2. Kiểm tra mật khẩu
    // Do mật khẩu từ Laravel cũ thường được hash bằng bcrypt, nên lệnh compare này sẽ hoạt động tốt!
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Sai mật khẩu');
    }

    // 3. Tạo Token (thời hạn 30 phút)
    const accessToken = jwt.sign(
        { id: Number(user.id), role: user.usertype },
        process.env.ACCESS_SECRET || 'access token',
        { expiresIn: '30m' }
    );
    const refreshToken = jwt.sign(
        { id: Number(user.id), role: user.usertype },
        process.env.REFRESH_SECRET || 'refresh token',
        { expiresIn: '7d' }
    );

    // Trả về thông tin user (nhưng giấu password đi) và token
    const { password: _, id, ...otherInfo } = user;
    const userInfo = {
        id: Number(id), // Convert BigInt sang Number để không bị lỗi JSON.stringify
        ...otherInfo
    };

    return { user: userInfo, accessToken, refreshToken };
};

export const registerUser = async (data: any) => {
    const { name, email, password, phone } = data;

    //Check trung email
    const existingUser = await prisma.users.findUnique({
        where: { email: email }
    });
    if (existingUser) {
        throw new Error('Email đã tồn tại trong hệ thống');
    }

    //Ma hoa password bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Sinh mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Luu thong tin vao DB kèm OTP
    const user = await prisma.users.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
            phone: phone,
            usertype: 'user',
            otp_code: otp,
            otp_expires_at: expiresAt
        }
    });

    // Gửi email thật qua Nodemailer
    await sendOtpEmail(email, otp);

    const { password: _, id, ...otherInfo } = user;
    const cleanUser = {
        id: Number(id),
        ...otherInfo
    };
    return { success: true, data: cleanUser };
};

export const verifyOtpService = async (email: string, otp: string) => {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
        throw new Error('Email không tồn tại');
    }

    if (user.otp_code !== otp) {
        throw new Error('Mã OTP không chính xác');
    }

    if (user.otp_expires_at && user.otp_expires_at < new Date()) {
        throw new Error('Mã OTP đã hết hạn');
    }

    // OTP đúng, cập nhật trạng thái verified và xóa OTP
    const updatedUser = await prisma.users.update({
        where: { id: user.id },
        data: {
            email_verified_at: new Date(),
            otp_code: null,
            otp_expires_at: null
        }
    });

    // Tạo token cho phép login luôn
    const accessToken = jwt.sign(
        { id: Number(updatedUser.id), role: updatedUser.usertype },
        process.env.ACCESS_SECRET || 'access token',
        { expiresIn: '30m' }
    );
    const refreshToken = jwt.sign(
        { id: Number(updatedUser.id), role: updatedUser.usertype },
        process.env.REFRESH_SECRET || 'refresh token',
        { expiresIn: '7d' }
    );

    const { password: _, id, ...otherInfo } = updatedUser;
    const userInfo = {
        id: Number(id),
        ...otherInfo
    };

    return { user: userInfo, accessToken, refreshToken };
};

export const getProfile = async (userId: number) => {
    const user = await prisma.users.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Trả về thông tin user (nhưng giấu password đi)
    const { password: _, id, ...otherInfo } = user;
    const userInfo = {
        id: Number(id), // Convert BigInt sang Number để không bị lỗi JSON.stringify
        ...otherInfo
    };

    return userInfo;
};

export const updateProfile = async (userId: number, data: updateUserDto) => {
    const existingUser = await prisma.users.findUnique({
        where: { id: userId }
    });
    if (!existingUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }

    if (data.password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
    }

    if (data.email && data.email !== existingUser.email) {
        const userWithSameEmail = await prisma.users.findUnique({
            where: { email: data.email }
        });

        if (userWithSameEmail) {
            throw new Error('Email này đã tồn tại trong hệ thống');
        }
    }

    const updateUser = await prisma.users.update({
        where: { id: userId },
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            usertype: data.usertype
        }
    })

    const { password: _, ...userWithoutPassword } = updateUser;

    return userWithoutPassword;


}