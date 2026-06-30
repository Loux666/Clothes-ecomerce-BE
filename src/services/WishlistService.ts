import prisma from '../config/prisma';

export const getMyWishlist = async (userId: string) => {
    return await prisma.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    basePrice: true,
                    salePrice: true,
                    images: { where: { isPrimary: true }, take: 1 }
                }
            }
        },
        orderBy: { addedAt: 'desc' }
    });
};

export const toggleWishlist = async (userId: string, productId: string) => {
    const existing = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId, productId } }
    });

    if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        return { isLiked: false };
    } else {
        await prisma.wishlist.create({ data: { userId, productId } });
        return { isLiked: true };
    }
};
