import prisma from '../config/prisma';

export const createReview = async (userId: string, data: any) => {
    // Kiểm tra xem user có mua sản phẩm này chưa (Status DELIVERED)
    const orderItem = await prisma.orderItem.findFirst({
        where: {
            id: data.orderItemId,
            order: {
                userId,
                status: 'DELIVERED'
            }
        }
    });

    if (!orderItem) throw new Error("Chỉ có thể đánh giá sản phẩm đã giao thành công");

    // Kiểm tra xem đã review chưa
    const existing = await prisma.review.findFirst({
        where: { orderItemId: data.orderItemId }
    });

    if (existing) throw new Error("Bạn đã đánh giá sản phẩm này rồi");

    return await prisma.review.create({
        data: {
            productId: data.productId,
            userId,
            orderItemId: data.orderItemId,
            rating: data.rating,
            comment: data.comment,
            images: data.images ? data.images : [],
            isVerified: true,
            status: 'PENDING' // Chờ admin duyệt (hoặc APPROVED luôn tùy logic)
        }
    });
};

export const getProductReviews = async (productId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        prisma.review.findMany({
            where: { productId, status: 'APPROVED' },
            skip,
            take: limit,
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.review.count({ where: { productId, status: 'APPROVED' } })
    ]);

    // Lấy sao trung bình
    const aggr = await prisma.review.aggregate({
        where: { productId, status: 'APPROVED' },
        _avg: { rating: true }
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit), averageRating: aggr._avg.rating };
};

export const getAllReviewsAdmin = async (page: number, limit: number, status?: string) => {
    const skip = (page - 1) * limit;
    const whereCondition = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
        prisma.review.findMany({
            where: whereCondition,
            skip,
            take: limit,
            include: { user: { select: { name: true } }, product: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.review.count({ where: whereCondition })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const updateReviewStatus = async (id: string, status: string) => {
    return await prisma.review.update({
        where: { id },
        data: { status: status as any }
    });
};
