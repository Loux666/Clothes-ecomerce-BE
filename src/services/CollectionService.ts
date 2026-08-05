import prisma from "../config/prisma";

export const createCollection = async (data: { 
    name: string; 
    slug: string; 
    description?: string; 
    eyebrow?: string; 
    imageUrl?: string; 
    isActive?: boolean;
    productIds?: string[];
}) => {
    const { productIds, ...colData } = data;
    return await prisma.collection.create({
        data: {
            ...colData,
            products: productIds && productIds.length > 0 ? {
                connect: productIds.map((id: string) => ({ id }))
            } : undefined
        },
        include: {
            products: {
                include: {
                    images: true
                }
            }
        }
    });
};

export const getAllCollections = async () => {
    return await prisma.collection.findMany({
        include: {
            products: {
                include: {
                    images: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getCollectionBySlug = async (slug: string) => {
    return await prisma.collection.findUnique({
        where: { slug: slug },
        include: {
            products: {
                include: {
                    images: true
                }
            }
        }
    });
};

export const updateCollection = async (id: string, data: { 
    name?: string; 
    slug?: string; 
    description?: string; 
    eyebrow?: string; 
    imageUrl?: string; 
    isActive?: boolean;
    productIds?: string[];
}) => {
    const { productIds, ...colData } = data;
    return await prisma.collection.update({
        where: { id: id },
        data: {
            ...colData,
            products: productIds !== undefined ? {
                set: productIds.map((pid: string) => ({ id: pid }))
            } : undefined
        },
        include: {
            products: {
                include: {
                    images: true
                }
            }
        }
    });
};

export const deleteCollection = async (id: string) => {
    return await prisma.collection.delete({
        where: { id: id }
    });
};
