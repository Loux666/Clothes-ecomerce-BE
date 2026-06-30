import prisma from '../config/prisma';

export const getInventoryLogs = async (page: number, limit: number, variantId?: string) => {
    const skip = (page - 1) * limit;
    const whereCondition = variantId ? { variantId } : {};

    const [data, total] = await Promise.all([
        prisma.inventoryLog.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                variant: {
                    include: {
                        product: { select: { name: true } },
                        attributes: { include: { attributeValue: { include: { attribute: true } } } }
                    }
                }
            }
        }),
        prisma.inventoryLog.count({ where: whereCondition })
    ]);
    
    // Format lại data cho dễ nhìn ở FE
    const formattedData = data.map(log => {
        const attributes = log.variant.attributes.map(a => `${a.attributeValue.attribute.name}: ${a.attributeValue.value}`).join(', ');
        return {
            ...log,
            productName: log.variant.product.name,
            variantDetails: attributes
        };
    });

    return { data: formattedData, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const manualRestock = async (variantId: string, quantity: number, note: string) => {
    return await prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.findUnique({ where: { id: variantId } });
        if (!variant) throw new Error("Variant không tồn tại");

        const updated = await tx.productVariant.update({
            where: { id: variantId },
            data: { stockQty: { increment: quantity } }
        });

        const log = await tx.inventoryLog.create({
            data: {
                variantId,
                changeQty: quantity,
                reason: quantity > 0 ? 'RESTOCK' : 'ADJUSTMENT',
                note
            }
        });

        return { variant: updated, log };
    });
};
