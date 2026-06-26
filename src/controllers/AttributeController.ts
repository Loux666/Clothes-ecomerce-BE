import { Request, Response } from "express";
import * as AttributeService from "../services/AttributeService";

export const getAllAttributesController = async (req: Request, res: Response) => {
    try {
        const attributes = await AttributeService.getAllAttributes();
        res.status(200).json({ message: "Lấy danh sách thuộc tính thành công", data: attributes });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const createAttributeController = async (req: Request, res: Response) => {
    try {
        const { name, type } = req.body;
        const attribute = await AttributeService.createAttribute({ name, type });
        res.status(201).json({ message: "Thêm thuộc tính thành công", data: attribute });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateAttributeController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string; // Lấy từ URL
        const { name, type } = req.body;
        const attribute = await AttributeService.updateAttribute(id, { name, type });
        res.status(200).json({ message: "Cập nhật thuộc tính thành công", data: attribute });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteAttributeController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string; // Lấy từ URL
        const attribute = await AttributeService.deleteAttribute(id);
        res.status(200).json({ message: "Xóa thuộc tính thành công", data: attribute });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// === ATTRIBUTE VALUE CONTROLLERS ===

export const createAttributeValueController = async (req: Request, res: Response) => {
    try {
        const attributeId = req.params.id as string; // /attributes/:id/values
        const data = req.body;
        const attrValue = await AttributeService.createAttributeValue(attributeId, data);
        res.status(201).json({ message: "Thêm giá trị thuộc tính thành công", data: attrValue });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateAttributeValueController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string; // /attributes/values/:id
        const data = req.body;
        const attrValue = await AttributeService.updateAttributeValue(id, data);
        res.status(200).json({ message: "Cập nhật giá trị thuộc tính thành công", data: attrValue });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteAttributeValueController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string; // /attributes/values/:id
        const attrValue = await AttributeService.deleteAttributeValue(id);
        res.status(200).json({ message: "Xóa giá trị thuộc tính thành công", data: attrValue });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}