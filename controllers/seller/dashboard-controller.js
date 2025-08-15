// dashboard-controller.js
const mongoose = require('mongoose');
const Order = require('../../models/Order');
const ProductReview = require('../../models/Review');

// Fungsi pembantu untuk memformat tanggal
const getStartOfWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Senin sebagai hari pertama
    return new Date(d.setDate(diff));
};

// Fungsi pembantu untuk mendapatkan nama bulan
const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Controller utama untuk mengambil semua data dashboard
exports.getSellerDashboardData = async (req, res) => {
    // sellerId didapatkan dari middleware otentikasi
    const sellerId = req.sellerId;

    if (!sellerId) {
        return res.status(401).json({ 
            status: 'error',
            message: 'Akses Ditolak: Seller ID tidak ditemukan.' 
        });
    }

    try {
        const today = new Date();
        const startOfWeek = getStartOfWeek();
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Menghitung Total Penjualan dan Pesanan Mingguan
        const weeklyData = await Order.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(sellerId),
                    orderDate: { $gte: startOfWeek, $lte: today },
                    orderStatus: 'delivered',
                    paymentStatus: 'Terbayar',
                }
            },
            {
                $group: {
                    _id: null,
                    totalWeeklySales: { $sum: '$totalAmount' },
                    totalWeeklyOrders: { $sum: 1 }
                }
            }
        ]);
        
        const totalWeeklySales = weeklyData.length > 0 ? weeklyData[0].totalWeeklySales : 0;
        const totalWeeklyOrders = weeklyData.length > 0 ? weeklyData[0].totalWeeklyOrders : 0;

        // Menghitung Rating Toko
        const storeRatingData = await ProductReview.aggregate([
            {
                $lookup: {
                    from: 'orders', // Nama koleksi orders
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'orderInfo'
                }
            },
            {
                $unwind: '$orderInfo'
            },
            {
                $match: {
                    'orderInfo.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$reviewValue' }
                }
            }
        ]);

        const storeRating = storeRatingData.length > 0 ? storeRatingData[0].averageRating.toFixed(1) : 0;

        // Menghitung Penjualan Bulanan untuk Grafik
        const monthlySalesData = await Order.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(sellerId),
                    orderDate: { $gte: startOfYear, $lte: today },
                    orderStatus: 'delivered',
                    paymentStatus: 'Terbayar',
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$orderDate' } },
                    total: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.month': 1 }
            }
        ]);

        // Mengisi bulan yang kosong dengan penjualan 0
        const monthlySales = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const data = monthlySalesData.find(item => item._id.month === month);
            return {
                name: monthNames[i],
                penjualan: data ? data.total : 0
            };
        });

        // Mengirimkan respons dengan data dashboard
        res.status(200).json({
            status: 'success',
            data: {
                weeklySales: totalWeeklySales,
                weeklyOrders: totalWeeklyOrders,
                storeRating: storeRating,
                monthlySales: monthlySales,
            }
        });

    } catch (error) {
        console.error("Gagal mendapatkan data dashboard:", error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan pada server saat mengambil data dashboard.'
        });
    }
};
