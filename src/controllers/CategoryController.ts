import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../services/CategoryService';

import { Request, Response } from 'express';

export const getAllCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
export const createCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, parentId, imageUrl, sortOrder, isActive } = req.body;
        const category = await createCategory({
            name,
            parentId,
            imageUrl,
            sortOrder,
            isActive
        });
        res.status(200).json({
            message: 'Thêm danh mục thành công',
            data: category
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { name, parentId, imageUrl, sortOrder, isActive } = req.body;
        const category = await updateCategory(id, {
            name,
            parentId,
            imageUrl,
            sortOrder,
            isActive
        });
        res.status(200).json({
            message: 'Cập nhật danh mục thành công',
            data: category
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await deleteCategory(req.params.id as string);
        res.status(200).json({
            message: 'Xóa danh mục thành công',
            data: category
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

