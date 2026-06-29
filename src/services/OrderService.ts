import prisma from '../config/prisma';

export const checkout = async (userId: string | undefined, data: any) => {
    // Để trống, sẽ implement chi tiết transaction trừ kho ở bước sau
    return { id: "draft_order_id", ...data };
};
