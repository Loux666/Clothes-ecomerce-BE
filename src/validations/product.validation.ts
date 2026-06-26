import { z } from "zod";

export const productImageSchema = z.object({
    url: z.string(),
    altText: z.string().optional().nullable(),
    sortOrder: z.number().default(0),
    isPrimary: z.boolean().default(false)
});

export const productVariantSchema = z.object({
    sku: z.string({
        message: "Vui lòng nhập mã SKU cho biến thể"
    }).min(1, "SKU không được để trống"),
    priceOverride: z.number().optional().nullable(),
    stockQty: z.number().min(0, "Tồn kho không được âm").default(0),
    weightGram: z.number().optional().nullable(),
    isActive: z.boolean().default(true),
    // Mảng chứa các ID của AttributeValue (VD: ["id_size_M", "id_color_Red"])
    attributeValueIds: z.array(z.string()).min(1, "Một biến thể phải có ít nhất 1 thuộc tính (size/color...)")
});

export const createProductSchema = z.object({
    categoryId: z.string().optional().nullable(),
    name: z.string({ message: "Vui lòng nhập tên sản phẩm" }).min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
    description: z.string().optional().nullable(),
    basePrice: z.number({ message: "Vui lòng nhập giá gốc" }).min(0, "Giá không được âm"),
    salePrice: z.number().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "UNISEX", "KIDS"]).optional().nullable(),
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).optional().nullable(),

    // Sản phẩm có thể có nhiều ảnh
    images: z.array(productImageSchema).optional(),

    // BẮT BUỘC: Sản phẩm phải có ít nhất 1 biến thể (dù không có size/màu thì vẫn tính là 1 biến thể mặc định)
    variants: z.array(productVariantSchema).min(1, "Sản phẩm phải có ít nhất 1 phân loại hàng (variant)")
});

// Phép thuật Zod: Tự động đẻ ra Interface cho Service xài
export type CreateProductType = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductType = z.infer<typeof updateProductSchema>;

export const updateStockSchema = z.object({
    changeQty: z.number({ message: "Vui lòng nhập số lượng thay đổi (dương hoặc âm)" }),
    reason: z.enum(["ORDER", "RETURN", "RESTOCK", "ADJUSTMENT"], { message: "Vui lòng chọn lý do" }),
    note: z.string().optional().nullable()
});
export type UpdateStockType = z.infer<typeof updateStockSchema>;
