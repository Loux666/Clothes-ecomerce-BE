import { Request, Response } from "express";
import * as ProductService from "../services/ProductService";
import { PrismaClient } from '@prisma/client';
import { ApiError } from "../utils/ApiError";
const prisma = new PrismaClient();

export const getAllProductsController = async (req: Request, res: Response) => {
    const filters = {
        gender: req.query.gender as string,
        categoryId: req.query.categoryId as string,
        collectionSlug: req.query.collection as string
    };
    const products = await ProductService.getAllProducts(filters);
    res.status(200).json({ message: "Lấy danh sách sản phẩm thành công", data: products });
}

export const createProductController = async (req: Request, res: Response) => {
    const productData = req.body;
    const product = await ProductService.createProduct(productData);
    res.status(201).json({ message: "Thêm sản phẩm thành công", data: product });
}

export const getProductBySlugController = async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const product = await ProductService.getProductBySlug(slug);
    if (!product) {
        throw new ApiError(404, "Không tìm thấy sản phẩm");
    }
    res.status(200).json({ message: "Lấy chi tiết sản phẩm thành công", data: product });
}

export const updateProductController = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const data = req.body;
    const product = await ProductService.updateProduct(id, data);
    res.status(200).json({ message: "Cập nhật sản phẩm thành công", data: product });
}

export const updateVariantStockController = async (req: Request, res: Response) => {
    const variantId = req.params.variantId as string;
    const data = req.body;
    const variant = await ProductService.updateVariantStock(variantId, data);
    res.status(200).json({ message: "Cập nhật tồn kho thành công", data: variant });
}

export const deleteProductController = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
        throw new ApiError(404, "Không tìm thấy sản phẩm");
    }
    await prisma.product.delete({
        where: { id }
    });
    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
}

export const updateVariantController = async (req: Request, res: Response) => {
    const variantId = req.params.variantId as string;
    const data = req.body;
    const existingVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!existingVariant) {
        throw new ApiError(404, "Không tìm thấy biến thể sản phẩm");
    }
    const variant = await prisma.productVariant.update({
        where: { id: variantId },
        data: {
            sku: data.sku,
            priceOverride: data.priceOverride,
            weightGram: data.weightGram,
            isActive: data.isActive
        }
    });
    res.status(200).json({ success: true, message: "Cập nhật biến thể thành công", data: variant });
}

export const deleteVariantController = async (req: Request, res: Response) => {
    const variantId = req.params.variantId as string;
    const existingVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!existingVariant) {
        throw new ApiError(404, "Không tìm thấy biến thể sản phẩm");
    }
    await prisma.productVariant.delete({
        where: { id: variantId }
    });
    res.status(200).json({ success: true, message: "Xóa biến thể thành công" });
}
