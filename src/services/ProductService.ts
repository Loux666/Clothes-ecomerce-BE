import prisma from "../config/prisma";
import { CreateProductType, UpdateProductType, UpdateStockType } from "../validations/product.validation";

export const createProduct = async (data: CreateProductType) => {
    // 1. Tạo slug thân thiện với URL (VD: Áo Khoác -> ao-khoac-1623432423)
    const baseSlug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').trim();
    const slug = `${baseSlug}-${Date.now()}`; // Gắn thêm timestamp để đảm bảo không bao giờ trùng slug

    // 2. Bắt đầu TRANSACTION (Chạy tất cả 4 lệnh insert cùng 1 lúc, lỗi 1 cái là Hủy Toàn Bộ)
    const product = await prisma.$transaction(async (tx) => {
        
        // 2.1 Insert Bảng 1: Product (Thông tin chung)
        const newProduct = await tx.product.create({
            data: {
                name: data.name,
                slug: slug,
                categoryId: data.categoryId,
                description: data.description,
                basePrice: data.basePrice,
                salePrice: data.salePrice,
                gender: data.gender,
                isFeatured: data.isFeatured,
                tags: data.tags ?? [], // Fallback mảng rỗng nếu không có tags
                collections: {
                    connect: data.collectionIds ? data.collectionIds.map(id => ({ id })) : []
                }
            }
        });

        // 2.2 Insert Bảng 2: Product Images (Ảnh sản phẩm)
        if (data.images && data.images.length > 0) {
            await tx.productImage.createMany({
                data: data.images.map(img => ({
                    productId: newProduct.id,
                    url: img.url,
                    altText: img.altText,
                    sortOrder: img.sortOrder,
                    isPrimary: img.isPrimary
                }))
            });
        }

        // 2.3 Insert Bảng 3: Variants (Từng phân loại hàng)
        for (const variant of data.variants) {
            const newVariant = await tx.productVariant.create({
                data: {
                    productId: newProduct.id,
                    sku: variant.sku,
                    priceOverride: variant.priceOverride,
                    salePriceOverride: variant.salePriceOverride,
                    stockQty: variant.stockQty,
                    weightGram: variant.weightGram,
                    isActive: variant.isActive
                }
            });

            // 2.4 Insert Bảng 4: Variant Attribute Values (Gắn phân loại hàng với Size M, Màu Đỏ...)
            if (variant.attributeValueIds && variant.attributeValueIds.length > 0) {
                await tx.variantAttributeValue.createMany({
                    data: variant.attributeValueIds.map(attrValId => ({
                        variantId: newVariant.id,
                        attributeValueId: attrValId
                    }))
                });
            }

            // 2.5 Insert Bảng 5: Variant Images (Ảnh riêng cho từng variant)
            if (variant.images && variant.images.length > 0) {
                await tx.variantImage.createMany({
                    data: variant.images.map(img => ({
                        variantId: newVariant.id,
                        url: img.url,
                        altText: img.altText,
                        sortOrder: img.sortOrder,
                        isPrimary: img.isPrimary
                    }))
                });
            }
        }

        // Trả về sản phẩm vừa tạo thành công (Chỉ trả về id hoặc info cơ bản)
        return newProduct;
    });

    return product;
}

export const getAllProducts = async (filters: any = {}) => {
    const where: any = {};
    if (filters.gender) where.gender = filters.gender;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.collectionSlug) {
        where.collections = {
            some: { slug: filters.collectionSlug }
        };
    }

    // Hàm này lấy toàn bộ sản phẩm và JOIN (Include) cực kỳ sâu vào các bảng con
    return await prisma.product.findMany({
        where: where,
        include: {
            images: true, // Lấy luôn ảnh
            category: true, // Lấy luôn tên danh mục
            collections: true, // Lấy các collection liên kết
            variants: {
                include: {
                    images: true, // Lấy ảnh riêng của variant
                    attributes: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true // Đi sâu vào lấy luôn tên Attribute (Size, Color)
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

export const getProductBySlug = async (slug: string) => {
    return await prisma.product.findUnique({
        where: { slug: slug },
        include: {
            images: true,
            category: true,
            collections: true,
            variants: {
                include: {
                    images: true, // Lấy ảnh riêng của variant
                    attributes: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

export const updateProduct = async (id: string, data: UpdateProductType) => {
    return await prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
            where: { id: id },
            data: {
                name: data.name,
                categoryId: data.categoryId,
                description: data.description,
                basePrice: data.basePrice,
                salePrice: data.salePrice,
                gender: data.gender,
                isFeatured: data.isFeatured,
                tags: data.tags ?? undefined,
                collections: data.collectionIds ? {
                    set: data.collectionIds.map(id => ({ id }))
                } : undefined
            }
        });

        if (data.images) {
            await tx.productImage.deleteMany({ where: { productId: id } });
            if (data.images.length > 0) {
                await tx.productImage.createMany({
                    data: data.images.map(img => ({
                        productId: id,
                        url: img.url,
                        altText: img.altText,
                        sortOrder: img.sortOrder,
                        isPrimary: img.isPrimary
                    }))
                });
            }
        }

        return updated;
    });
}

export const updateVariantStock = async (variantId: string, data: UpdateStockType) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Ghi log sự thay đổi
        await tx.inventoryLog.create({
            data: {
                variantId: variantId,
                changeQty: data.changeQty,
                reason: data.reason,
                note: data.note
            }
        });

        // 2. Cập nhật tồn kho thực tế (Dùng phép tính increment cho cả số âm và dương)
        return await tx.productVariant.update({
            where: { id: variantId },
            data: {
                stockQty: {
                    increment: data.changeQty
                }
            }
        });
    });
}
