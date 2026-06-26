import { Request, Response } from "express";
import * as ProductService from "../services/ProductService";

export const getAllProductsController = async (req: Request, res: Response) => {
    try {
        const products = await ProductService.getAllProducts();
        res.status(200).json({ message: "Lấy danh sách sản phẩm thành công", data: products });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const createProductController = async (req: Request, res: Response) => {
    try {
        const productData = req.body;
        const product = await ProductService.createProduct(productData);
        res.status(201).json({ message: "Thêm sản phẩm thành công", data: product });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const getProductBySlugController = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const product = await ProductService.getProductBySlug(slug);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(200).json({ message: "Lấy chi tiết sản phẩm thành công", data: product });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateProductController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const product = await ProductService.updateProduct(id, data);
        res.status(200).json({ message: "Cập nhật sản phẩm thành công", data: product });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateVariantStockController = async (req: Request, res: Response) => {
    try {
        const variantId = req.params.variantId as string;
        const data = req.body;
        const variant = await ProductService.updateVariantStock(variantId, data);
        res.status(200).json({ message: "Cập nhật tồn kho thành công", data: variant });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
