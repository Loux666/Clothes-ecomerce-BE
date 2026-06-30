import prisma from '../config/prisma';

export const getSetting = async (keyName: string) => {
    const setting = await prisma.setting.findUnique({
        where: { keyName }
    });
    return setting ? setting.value : null;
};

export const updateSetting = async (keyName: string, value: any) => {
    return await prisma.setting.upsert({
        where: { keyName },
        update: { value },
        create: { keyName, value }
    });
};
