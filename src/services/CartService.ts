import prisma from '../config/prisma';


export const getCartItems = async (userId: string) => {
    const cart = await prisma.cart.upsert({
        where: { userId: userId },
        update: {},
        create: { userId: userId },
        include: {
            items: {
                orderBy: {
                    addedAt: 'desc'
                },
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    basePrice: true,
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1
                                    }

                                }
                            },
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
            }
        }
    })
    return cart;
};

export const addToCart = async (userId: string, data: { variantId: string; quantity: number }) => {
    // 1. Lấy giỏ hàng của User (chưa có thì tạo)
    const cart = await prisma.cart.upsert({
        where: { userId: userId },
        update: {},
        create: { userId: userId }
    });

    // 2. Kiểm tra sản phẩm có thật không và còn đủ hàng không?
    const variant = await prisma.productVariant.findUnique({
        where: { id: data.variantId }
    });

    if (!variant) {
        throw new Error("Phân loại sản phẩm không tồn tại!");
    }
    
    // Tùy nghiệp vụ: Bạn có thể bỏ đoạn check tồn kho này nếu muốn cho khách cứ thêm vào giỏ thoải mái, lúc thanh toán mới check. 
    // Nhưng check luôn ở đây sẽ tốt cho UX hơn.
    if (variant.stockQty < data.quantity) {
        throw new Error(`Kho chỉ còn ${variant.stockQty} sản phẩm!`);
    }

    // 3. Upsert CartItem (Đã có thì cộng dồn, chưa có thì tạo mới)
    const cartItem = await prisma.cartItem.upsert({
        where: {
            // Đây là khóa phụ kết hợp 2 cột mà ta đã khai báo @@unique([cartId, variantId]) trong schema
            cartId_variantId: {
                cartId: cart.id,
                variantId: data.variantId
            }
        },
        update: {
            quantity: {
                increment: data.quantity // CỘNG DỒN nếu đã có trong giỏ
            }
        },
        create: {
            cartId: cart.id,
            variantId: data.variantId,
            quantity: data.quantity // TẠO MỚI
        }
    });

    return cartItem;
};

export const updateCartItem = async (userId: string, variantId: string, quantity: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Giỏ hàng không tồn tại!");

    try {
        // Dùng cho nút [+] [-] hoặc ô input sửa số lượng trên Frontend
        return await prisma.cartItem.update({
            where: {
                cartId_variantId: { cartId: cart.id, variantId: variantId }
            },
            data: { quantity: quantity } // GHI ĐÈ bằng số lượng mới
        });
    } catch (error) {
        throw new Error("Sản phẩm này không nằm trong giỏ hàng của bạn!");
    }
};

export const removeCartItem = async (userId: string, variantId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Giỏ hàng không tồn tại!");

    try {
        return await prisma.cartItem.delete({
            where: {
                cartId_variantId: { cartId: cart.id, variantId: variantId }
            }
        });
    } catch (error) {
        throw new Error("Sản phẩm này không tồn tại trong giỏ hàng!");
    }
};

