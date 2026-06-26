import prisma from "../config/prisma";
import { CreateAttributeType, UpdateAttributeType, CreateAttributeValueType, UpdateAttributeValueType } from "../validations/attribute.validation";

export const getAllAttributes = async () => {
    const attributes = await prisma.attribute.findMany({
        include: {
            values: true
        }
    });
    return attributes;
}

export const createAttribute = async (data: CreateAttributeType) => {
    const attribute = await prisma.attribute.create({
        data: {
            name: data.name,
            type: data.type
        }
    });
    return attribute;
}

export const updateAttribute = async (id: string, data: UpdateAttributeType) => {
    const attribute = await prisma.attribute.update({
        where: { id: id },
        data: {
            name: data.name,
            type: data.type
        }
    });
    return attribute;
}

export const deleteAttribute = async (id: string) => {
    const attribute = await prisma.attribute.delete({
        where: { id: id }
    });
    return attribute;
}

// === ATTRIBUTE VALUE ===

export const createAttributeValue = async (attributeId: string, data: CreateAttributeValueType) => {
    return await prisma.attributeValue.create({
        data: {
            attributeId: attributeId,
            value: data.value,
            hexCode: data.hexCode,
            sortOrder: data.sortOrder
        }
    });
}

export const updateAttributeValue = async (id: string, data: UpdateAttributeValueType) => {
    return await prisma.attributeValue.update({
        where: { id: id },
        data: {
            value: data.value,
            hexCode: data.hexCode,
            sortOrder: data.sortOrder
        }
    });
}

export const deleteAttributeValue = async (id: string) => {
    return await prisma.attributeValue.delete({
        where: { id: id }
    });
}