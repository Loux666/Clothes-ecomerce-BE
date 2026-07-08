import nodemailer from 'nodemailer';

// Cấu hình transporter với Mailtrap (sẽ lấy từ biến môi trường)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
    port: Number(process.env.MAIL_PORT) || 2525,
    auth: {
        user: process.env.MAIL_USER || "your_mailtrap_user",
        pass: process.env.MAIL_PASS || "your_mailtrap_pass"
    }
});

export const sendOtpEmail = async (toEmail: string, otpCode: string) => {
    try {
        const mailOptions = {
            from: '"Clothes Shop" <no-reply@clothesshop.com>',
            to: toEmail,
            subject: 'Mã xác thực OTP của bạn',
            html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Xác nhận địa chỉ email</h2>
                    <p>Chào bạn,</p>
                    <p>Mã OTP để xác thực tài khoản của bạn là:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #000;">
                        ${otpCode}
                    </div>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho người khác.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Đã gửi email OTP thành công: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email OTP:', error);
        return false;
    }
};
