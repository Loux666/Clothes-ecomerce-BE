import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  // Tổng số đơn hàng
  const totalOrders = await prisma.order.count();
  
  // Tổng số khách hàng
  const totalUsers = await prisma.user.count({
    where: { role: 'USER' }
  });
  
  // Doanh thu (chỉ tính đơn hàng đã thanh toán hoặc đã giao)
  const revenueAggr = await prisma.order.aggregate({
    _sum: {
      totalAmount: true
    },
    where: {
      paymentStatus: 'PAID'
    }
  });
  const totalRevenue = revenueAggr._sum.totalAmount || 0;

  // Sản phẩm sắp hết hàng (stock < 10)
  const lowStockVariants = await prisma.productVariant.findMany({
    where: {
      stockQty: { lt: 10 },
      isActive: true
    },
    include: {
      product: { select: { name: true } },
      attributes: {
        include: { attributeValue: true }
      }
    },
    take: 10
  });

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalUsers,
      totalRevenue,
      lowStockVariants
    }
  });
};
