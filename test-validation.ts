import { createCouponSchema } from './src/validations/coupon.validation';

const payload = {
    code: "ADMIN",
    type: "PERCENTAGE",
    value: 99,
    maxDiscount: null,
    minOrderValue: null,
    startDate: "2026-07-10T09:10:00.000Z",
    endDate: "2030-12-09T09:10:00.000Z",
    isActive: true,
    usageLimit: null
};

async function testValidation() {
    try {
        const result = await createCouponSchema.parseAsync({ body: payload });
        console.log("✅ Validation passed!");
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.log("❌ Validation failed!");
        if (error.issues) {
            console.log(JSON.stringify(error.issues, null, 2));
        } else {
            console.log(error);
        }
    }
}

testValidation();
