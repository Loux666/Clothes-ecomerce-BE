import prisma from '../config/prisma';

export const getMyAddresses = async (userId: string) => {
    return await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' }
    });
};

export const createAddress = async (userId: string, data: any) => {
    return await prisma.$transaction(async (tx) => {
        if (data.isDefault) {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        return await tx.address.create({
            data: { ...data, userId }
        });
    });
};

export const updateAddress = async (id: string, userId: string, data: any) => {
    return await prisma.$transaction(async (tx) => {
        const addr = await tx.address.findFirst({ where: { id, userId } });
        if (!addr) throw new Error("Địa chỉ không tồn tại");

        if (data.isDefault) {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        return await tx.address.update({
            where: { id },
            data
        });
    });
};

export const deleteAddress = async (id: string, userId: string) => {
    const addr = await prisma.address.findFirst({ where: { id, userId } });
    if (!addr) throw new Error("Địa chỉ không tồn tại");

    return await prisma.address.delete({ where: { id } });
};
