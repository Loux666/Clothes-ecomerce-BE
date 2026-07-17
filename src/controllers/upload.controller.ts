import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const uploadFiles = (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        throw new ApiError(400, 'Không tìm thấy file để upload');
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
};
