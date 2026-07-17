import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../services/CategoryService';

import { Request, Response } from 'express';

export const getAllCategoriesController = async (req: Request, res: Response): Promise<void> => {
    const categories = await getAllCategories();
    res.status(200).json({ data: categories });
}
export const createCategoryController = async (req: Request, res: Response): Promise<void> => {
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
}

export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
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
}

export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
    const category = await deleteCategory(req.params.id as string);
    res.status(200).json({
        message: 'Xóa danh mục thành công',
        data: category
    });
}

