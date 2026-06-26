import { Request, Response } from 'express';

export const uploadFiles = (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy file để upload'
            });
        }

        const files = req.files as Express.Multer.File[];
        
        const uploadedData = files.map(file => ({
            url: `/uploads/${file.filename}`,
            fileName: file.filename
        }));

        res.status(201).json({
            success: true,
            data: uploadedData,
            message: 'Upload file thành công'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi upload file'
        });
    }
};
