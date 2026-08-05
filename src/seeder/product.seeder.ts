import { PrismaClient, ProductGender, ProductStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PRODUCTS_SOURCE_DIR = path.join(__dirname, '../../products');
const PRODUCTS_DEST_DIR = path.join(__dirname, '../public/uploads/products');

const PRODUCT_NAMES = [
    'Áo Polo Nam Form Regular Premium',
    'Áo Thun Oversize Unisex Streetwear',
    'Áo Sơ Mi Dài Tay Kháng Khuẩn',
    'Áo Khoác Bomber Thể Thao',
    'Quần Shorts Kaki Năng Động',
    'Quần Jeans Slimfit Co Giãn',
    'Áo Hoodies Fleece Ấm Áp',
    'Áo Sweater Co-ord Basic',
    'Áo Tanktop Thể Thao Breathable',
    'Quần Jogger Bo Gấu Nỉ Bông',
    'Áo Sơ Mi Cổ Tàu Linen Lightweight',
    'Áo Thun Cổ Tròn Cotton Compact',
    'Quần Tây Tapered Fit Công Sở',
    'Áo Khoác Cardigan Len Mỏng',
    'Áo Polo Pique Cotton Thêu Logo',
    'Quần Shorts Running Siêu Nhẹ',
    'Áo Sơ Mi Caro Vintage Style',
    'Áo Windbreaker Chống Nước Minimalist'
];

const COLOR_PAIRS = [
    [ { name: 'Đen', hex: '#000000' }, { name: 'Trắng', hex: '#FFFFFF' } ],
    [ { name: 'Xanh Navy', hex: '#0B2545' }, { name: 'Kem', hex: '#F5F5DC' } ],
    [ { name: 'Xám Tối', hex: '#4A4A4A' }, { name: 'Đỏ Đô', hex: '#800020' } ],
    [ { name: 'Xanh Rêu', hex: '#4B5320' }, { name: 'Vàng Mù Tạt', hex: '#E1AD01' } ],
    [ { name: 'Nâu Cà Phê', hex: '#4A2C2A' }, { name: 'Xanh Sky', hex: '#87CEEB' } ],
    [ { name: 'Hồng Pastel', hex: '#FFB6C1' }, { name: 'Xám Ghi', hex: '#D3D3D3' } ]
];

const SIZES = ['S', 'M', 'L', 'XL'];

async function seed() {
    console.log('🚀 Bắt đầu chạy Product Seeder...');

    // 1. Sao chép ảnh từ folder products/ sang public/uploads/products/
    if (!fs.existsSync(PRODUCTS_DEST_DIR)) {
        fs.mkdirSync(PRODUCTS_DEST_DIR, { recursive: true });
    }

    if (!fs.existsSync(PRODUCTS_SOURCE_DIR)) {
        console.error(`❌ Không tìm thấy thư mục: ${PRODUCTS_SOURCE_DIR}`);
        return;
    }

    const files = fs.readdirSync(PRODUCTS_SOURCE_DIR)
        .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`📁 Tìm thấy ${files.length} ảnh trong thư mục /products.`);

    if (files.length === 0) {
        console.error('❌ Không có ảnh nào trong thư mục products!');
        return;
    }

    for (const file of files) {
        fs.copyFileSync(path.join(PRODUCTS_SOURCE_DIR, file), path.join(PRODUCTS_DEST_DIR, file));
    }
    console.log(`✅ Đã copy ${files.length} ảnh sang public/uploads/products.`);

    // 2. Tạo hoặc lấy Thuộc tính (Attribute) Kích thước & Màu sắc
    let sizeAttr = await prisma.attribute.findFirst({ where: { name: 'Kích thước' } });
    if (!sizeAttr) {
        sizeAttr = await prisma.attribute.create({ data: { name: 'Kích thước', type: 'button' } });
    }

    let colorAttr = await prisma.attribute.findFirst({ where: { name: 'Màu sắc' } });
    if (!colorAttr) {
        colorAttr = await prisma.attribute.create({ data: { name: 'Màu sắc', type: 'color' } });
    }

    // Tạo các giá trị Size
    const sizeValuesMap: Record<string, string> = {};
    for (const sz of SIZES) {
        let sizeVal = await prisma.attributeValue.findFirst({
            where: { attributeId: sizeAttr.id, value: sz }
        });
        if (!sizeVal) {
            sizeVal = await prisma.attributeValue.create({
                data: { attributeId: sizeAttr.id, value: sz }
            });
        }
        sizeValuesMap[sz] = sizeVal.id;
    }

    // 3. Tạo 3 Cấp Danh Mục (Cấp 0: Nam/Nữ/Unisex -> Cấp 1: Áo/Quần -> Cấp 2: Áo Polo, Áo Thun, Quần Shorts...)
    // Cấp 0 (Gốc / Cha)
    const catNam = await prisma.category.upsert({
        where: { slug: 'nam' },
        update: {},
        create: { name: 'Thời trang Nam', slug: 'nam', sortOrder: 1 }
    });

    const catNu = await prisma.category.upsert({
        where: { slug: 'nu' },
        update: {},
        create: { name: 'Thời trang Nữ', slug: 'nu', sortOrder: 2 }
    });

    const catUnisex = await prisma.category.upsert({
        where: { slug: 'unisex' },
        update: {},
        create: { name: 'Thời trang Unisex', slug: 'unisex', sortOrder: 3 }
    });

    // Cấp 1 (Con của Cấp 0)
    const catAoNam = await prisma.category.upsert({
        where: { slug: 'ao-nam' },
        update: { parentId: catNam.id },
        create: { name: 'Áo Nam', slug: 'ao-nam', parentId: catNam.id, sortOrder: 1 }
    });

    const catQuanNam = await prisma.category.upsert({
        where: { slug: 'quan-nam' },
        update: { parentId: catNam.id },
        create: { name: 'Quần Nam', slug: 'quan-nam', parentId: catNam.id, sortOrder: 2 }
    });

    const catAoNu = await prisma.category.upsert({
        where: { slug: 'ao-nu' },
        update: { parentId: catNu.id },
        create: { name: 'Áo Nữ', slug: 'ao-nu', parentId: catNu.id, sortOrder: 1 }
    });

    const catQuanNu = await prisma.category.upsert({
        where: { slug: 'quan-nu' },
        update: { parentId: catNu.id },
        create: { name: 'Quần Nữ', slug: 'quan-nu', parentId: catNu.id, sortOrder: 2 }
    });

    const catAoUnisex = await prisma.category.upsert({
        where: { slug: 'ao-unisex' },
        update: { parentId: catUnisex.id },
        create: { name: 'Áo Unisex', slug: 'ao-unisex', parentId: catUnisex.id, sortOrder: 1 }
    });

    // Cấp 2 (Con của Cấp 1)
    const leafCats = [
        // Áo Nam (Cấp 2)
        await prisma.category.upsert({
            where: { slug: 'ao-polo-nam' },
            update: { parentId: catAoNam.id },
            create: { name: 'Áo Polo Nam', slug: 'ao-polo-nam', parentId: catAoNam.id, sortOrder: 1 }
        }),
        await prisma.category.upsert({
            where: { slug: 'ao-thun-nam' },
            update: { parentId: catAoNam.id },
            create: { name: 'Áo Thun Nam', slug: 'ao-thun-nam', parentId: catAoNam.id, sortOrder: 2 }
        }),
        await prisma.category.upsert({
            where: { slug: 'ao-so-mi-nam' },
            update: { parentId: catAoNam.id },
            create: { name: 'Áo Sơ Mi Nam', slug: 'ao-so-mi-nam', parentId: catAoNam.id, sortOrder: 3 }
        }),
        // Quần Nam (Cấp 2)
        await prisma.category.upsert({
            where: { slug: 'quan-shorts-nam' },
            update: { parentId: catQuanNam.id },
            create: { name: 'Quần Shorts Nam', slug: 'quan-shorts-nam', parentId: catQuanNam.id, sortOrder: 1 }
        }),
        await prisma.category.upsert({
            where: { slug: 'quan-jeans-nam' },
            update: { parentId: catQuanNam.id },
            create: { name: 'Quần Jeans Nam', slug: 'quan-jeans-nam', parentId: catQuanNam.id, sortOrder: 2 }
        }),
        await prisma.category.upsert({
            where: { slug: 'quan-jogger-nam' },
            update: { parentId: catQuanNam.id },
            create: { name: 'Quần Jogger Nam', slug: 'quan-jogger-nam', parentId: catQuanNam.id, sortOrder: 3 }
        }),
        // Áo Nữ (Cấp 2)
        await prisma.category.upsert({
            where: { slug: 'ao-crop-top-nu' },
            update: { parentId: catAoNu.id },
            create: { name: 'Áo Crop Top Nữ', slug: 'ao-crop-top-nu', parentId: catAoNu.id, sortOrder: 1 }
        }),
        await prisma.category.upsert({
            where: { slug: 'ao-so-mi-nu' },
            update: { parentId: catAoNu.id },
            create: { name: 'Áo Sơ Mi Nữ', slug: 'ao-so-mi-nu', parentId: catAoNu.id, sortOrder: 2 }
        }),
        // Quần Nữ (Cấp 2)
        await prisma.category.upsert({
            where: { slug: 'quan-shorts-nu' },
            update: { parentId: catQuanNu.id },
            create: { name: 'Quần Shorts Nữ', slug: 'quan-shorts-nu', parentId: catQuanNu.id, sortOrder: 1 }
        }),
        // Unisex (Cấp 2)
        await prisma.category.upsert({
            where: { slug: 'ao-hoodie-unisex' },
            update: { parentId: catAoUnisex.id },
            create: { name: 'Áo Hoodie Unisex', slug: 'ao-hoodie-unisex', parentId: catAoUnisex.id, sortOrder: 1 }
        })
    ];

    // 4. Tạo Collections (Bộ sưu tập)
    const collections = [
        await prisma.collection.upsert({
            where: { slug: 'best-seller' },
            update: {},
            create: { name: 'Best Seller', slug: 'best-seller', eyebrow: 'Hot Picks', description: 'Các sản phẩm bán chạy nhất được yêu thích.' }
        }),
        await prisma.collection.upsert({
            where: { slug: 'new' },
            update: {},
            create: { name: 'Bản Phố Mới - New Drop', slug: 'new', eyebrow: 'New Arrival', description: 'Những mẫu thiết kế mới nhất vừa hạ cánh.' }
        }),
        await prisma.collection.upsert({
            where: { slug: 'summer' },
            update: {},
            create: { name: 'Thời trang Mùa hè', slug: 'summer', eyebrow: 'Summer Collection', description: 'Trang phục thoáng mát cho mùa hè sôi động.' }
        }),
        await prisma.collection.upsert({
            where: { slug: 'sport' },
            update: {},
            create: { name: 'Đồ thể thao Performance', slug: 'sport', eyebrow: 'Sport Performance', description: 'Đồ thể thao co giãn 4 chiều vận động thoải mái.' }
        }),
        await prisma.collection.upsert({
            where: { slug: 'streetwear' },
            update: {},
            create: { name: 'Bộ sưu tập Streetwear', slug: 'streetwear', eyebrow: 'Street Culture', description: 'Phong cách đường phố chất lừ.' }
        })
    ];

    // 5. Xóa dữ liệu cũ sản phẩm thử nghiệm nếu có để tránh trùng lặp SKU
    console.log('🧹 Đang làm sạch dữ liệu sản phẩm cũ...');
    await prisma.product.deleteMany({});

    // 6. Ghép cặp 2 ảnh -> 1 sản phẩm (2 màu sắc)
    const totalProductsCount = Math.ceil(files.length / 2);
    console.log(`📦 Đang khởi tạo ${totalProductsCount} sản phẩm (mỗi sản phẩm 2 ảnh = 2 màu sắc)...`);

    for (let pIndex = 0; pIndex < totalProductsCount; pIndex++) {
        const imgFile1 = files[pIndex * 2];
        const imgFile2 = files[pIndex * 2 + 1] || imgFile1; // Nếu lẻ ảnh thì dùng lại ảnh 1

        const imgUrl1 = `/uploads/products/${imgFile1}`;
        const imgUrl2 = `/uploads/products/${imgFile2}`;

        const colorPairObj = COLOR_PAIRS[pIndex % COLOR_PAIRS.length];
        const c1Config = colorPairObj[0];
        const c2Config = colorPairObj[1];

        // Lấy hoặc tạo AttributeValue cho màu 1 & màu 2
        let colorVal1 = await prisma.attributeValue.findFirst({
            where: { attributeId: colorAttr.id, value: c1Config.name }
        });
        if (!colorVal1) {
            colorVal1 = await prisma.attributeValue.create({
                data: { attributeId: colorAttr.id, value: c1Config.name, hexCode: c1Config.hex }
            });
        }

        let colorVal2 = await prisma.attributeValue.findFirst({
            where: { attributeId: colorAttr.id, value: c2Config.name }
        });
        if (!colorVal2) {
            colorVal2 = await prisma.attributeValue.create({
                data: { attributeId: colorAttr.id, value: c2Config.name, hexCode: c2Config.hex }
            });
        }

        const prodName = PRODUCT_NAMES[pIndex % PRODUCT_NAMES.length] + ` #${pIndex + 1}`;
        const slug = `san-pham-${pIndex + 1}-${Date.now()}`;
        const category = leafCats[pIndex % leafCats.length];
        const basePrice = (199 + (pIndex % 10) * 50) * 1000;
        const salePrice = pIndex % 3 === 0 ? (basePrice * 0.8) : null;
        const gender: ProductGender = pIndex % 4 === 0 ? ProductGender.FEMALE : (pIndex % 3 === 0 ? ProductGender.UNISEX : ProductGender.MALE);

        // Gán 1-2 Collections ngẫu nhiên/theo thứ tự cho mỗi sản phẩm
        const assignedCollections = [
            collections[pIndex % collections.length],
            collections[(pIndex + 2) % collections.length]
        ].filter((c, idx, self) => self.findIndex(x => x.id === c.id) === idx);

        // Tạo Product + ProductImages + Collections
        const product = await prisma.product.create({
            data: {
                name: prodName,
                slug: slug,
                description: `Sản phẩm ${prodName} chất lượng cao, thoáng mát, thiết kế thời trang hiện đại phù hợp mặc hàng ngày.`,
                basePrice: basePrice,
                salePrice: salePrice,
                categoryId: category.id,
                gender: gender,
                status: ProductStatus.ACTIVE,
                isFeatured: pIndex % 2 === 0,
                collections: {
                    connect: assignedCollections.map(c => ({ id: c.id }))
                },
                images: {
                    create: [
                        { url: imgUrl1, altText: `${prodName} - ${c1Config.name}`, isPrimary: true, sortOrder: 1 },
                        { url: imgUrl2, altText: `${prodName} - ${c2Config.name}`, isPrimary: false, sortOrder: 2 }
                    ]
                }
            }
        });

        // Tạo Variants cho từng màu (2 màu x 4 size = 8 variants per product)
        const colorConfigs = [
            { colorVal: colorVal1, imgUrl: imgUrl1, code: 'C1' },
            { colorVal: colorVal2, imgUrl: imgUrl2, code: 'C2' }
        ];

        for (const cConf of colorConfigs) {
            for (const sz of SIZES) {
                const sku = `PROD-${pIndex + 1}-${cConf.code}-${sz}`;
                const variant = await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: sku,
                        stockQty: 50 + (pIndex * 5) % 100,
                        isActive: true,
                        images: {
                            create: {
                                url: cConf.imgUrl,
                                altText: `${prodName} - ${sz}`,
                                isPrimary: true,
                                sortOrder: 1
                            }
                        }
                    }
                });

                // Gắn quan hệ Variant <-> AttributeValues (Size & Color)
                await prisma.variantAttributeValue.createMany({
                    data: [
                        { variantId: variant.id, attributeValueId: sizeValuesMap[sz] },
                        { variantId: variant.id, attributeValueId: cConf.colorVal.id }
                    ]
                });
            }
        }
    }

    console.log('🎉 Seed sản phẩm thành công rực rỡ!');
}

seed()
    .catch(e => {
        console.error('❌ Lỗi khi seed sản phẩm:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

