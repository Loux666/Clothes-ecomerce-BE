import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";


export const getAllCategories = async () => {
    return await prisma.category.findMany({
        include: {
            parent: {
                include: {
                    parent: true
                }
            },
            children: true
        },
        orderBy: {
            sortOrder: 'asc'
        }
    });
}

export const createCategory = async (data: {
    name: string;
    parentId?: string | null;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
}) => {
    const slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').trim();

    // Kiểm tra slug có tồn tại không
    // const existingCategory = await prisma.category.findUnique({
    //     where: {
    //         slug
    //     }
    // })

    // if (existingCategory) {
    //     throw new Error("Danh mục đã tồn tại")
    // }

    // 
    return await prisma.category.create({
        data: {
            name: data.name,
            slug: slug,
            parentId: data.parentId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
        }
    })

}

export const updateCategory = async (categoryId: string, data: {
    name: string;
    parentId?: string | null;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
}) => {
    const existingCategory = await prisma.category.findUnique({
        where: {
            id: categoryId
        }
    })
    if (!existingCategory) {
        throw new ApiError(404, "Danh mục không tồn tại")
    }

    const slug = data.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').trim();
    return await prisma.category.update({
        where: {
            id: categoryId
        },
        data: {
            name: data.name,
            slug: slug,
            parentId: data.parentId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
        }
    })

}

export const deleteCategory = async (categoryId: string) => {
    const existingCategory = await prisma.category.findUnique({
        where: {
            id: categoryId
        }
    })
    if (!existingCategory) {
        throw new ApiError(404, "Danh mục không tồn tại")
    }
    return await prisma.category.delete({
        where: {
            id: categoryId
        }
    })
}