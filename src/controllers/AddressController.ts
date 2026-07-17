import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as addressService from '../services/AddressService';

export const getMyAddresses = async (req: AuthRequest, res: Response) => {
    const addresses = await addressService.getMyAddresses(req.user!.id);
    res.status(200).json({ data: addresses });
};

export const createAddress = async (req: AuthRequest, res: Response) => {
    const address = await addressService.createAddress(req.user!.id, req.body);
    res.status(201).json({ message: "Thêm địa chỉ thành công", data: address });
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
    const address = await addressService.updateAddress(req.params.id as string, req.user!.id, req.body);
    res.status(200).json({ message: "Cập nhật địa chỉ thành công", data: address });
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
    await addressService.deleteAddress(req.params.id as string, req.user!.id);
    res.status(200).json({ message: "Xóa địa chỉ thành công" });
};
