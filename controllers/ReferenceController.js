const { default: axios } = require("axios");
const { Booking, User, BankAccount, Withdrawal } = require("../models"); // Make sure Booking and User are imported correctly
const { Commission } = require("../models");
// const BankAccount = require('../models/bankAccount');

// Calculate commission based on referrals
// exports.calculateCommission = async (req, res) => {
//   try {
//     const { userId } = req.params; // The user for whom to calculate commissions
//     // console.log(req.body,req.param/s)
//     // Get bookings made directly by the user
//     const directBookings = await Booking.findAll({
//       where: { booked_by: userId, payment_status: "paid" }, // Direct bookings by the user,
//       // Only include paid bookings
//     });
//     // console.log(directBookings.length)
//     // Calculate total sales from direct bookings
//     const directSalesTotal = directBookings.reduce(
//       (acc, booking) => acc + booking.subTotal,
//       0
//     );
//     // console.log(directSalesTotal)
//     // Get all L1 referrals (users who referred this user)
//     const level1Referrals = await User.findAll({
//       where: { referrerId: userId },
//       // payment_status: 'paid' // Users that referred this user
//     });
//     console.log(level1Referrals);

//     // Get L1 bookings (bookings made by L1 referrals)
//     const l1Bookings = await Booking.findAll({
//       where: {
//         booked_by: level1Referrals.map((ref) => ref.id),
//         payment_status: "paid",
//       }, // Bookings made by L1 referrals
//     });
//     console.log(l1Bookings);

//     // Calculate total sales from L1 bookings
//     const l1SalesTotal = l1Bookings.reduce(
//       (acc, booking) => acc + booking.subTotal,
//       0
//     );

//     // Get all L2 referrals (users who were referred by L1 referrals)
//     const level2Referrals = await User.findAll({
//       where: { referrerId: level1Referrals.map((ref) => ref.id) }, // Users referred by L1
//     });

//     // Get L2 bookings (bookings made by L2 referrals)
//     const l2Bookings = await Booking.findAll({
//       where: {
//         booked_by: level2Referrals.map((ref) => ref.id),

//         payment_status: "paid",
//       },
//       // Bookings made by L2 referrals
//     });

//     // Calculate total sales from L2 bookings
//     const l2SalesTotal = l2Bookings.reduce(
//       (acc, booking) => acc + booking.subTotal,
//       0
//     );

//     // Calculate commissions
//     const directCommission = directSalesTotal * 0.05; // 5% commission on direct sales
//     const l1Commission = l1SalesTotal * 0.03; // 3% commission on L1 sales
//     const l2Commission = l2SalesTotal * 0.02; // 2% commission on L2 sales

//     const totalCommission = await Commission.findOne({
//       where: { userId },
//     });
//     console.log(totalCommission.totalCommission, "total");
//     const data = totalCommission.totalCommission;

//     const WithdrawalData = await Withdrawal.findAll({
//       where: { userId: userId },
//     })
//     console.log(WithdrawalData,'withdraw')
//     // save commsion
//     // await Commission.create({

//     //   userId,
//     //   directSales: directSalesTotal,
//     //   level1Sales: l1SalesTotal,
//     //   level2Sales: l2SalesTotal,
//     //   directCommission,
//     //   l1Commission,
//     //   l2Commission,
//     //   totalCommission
//     // });

//     // Step 6: Send the commission data to Zoho

//     return res.json({
//       userId,
//       totalSales: {
//         directSales: directSalesTotal,
//         level1Sales: l1SalesTotal,
//         level2Sales: l2SalesTotal,
//       },
//       totalCommission: data,
//       breakdown: {
//         directCommission,
//         l1Commission,
//         l2Commission,
//       },
//     });
//   } catch (error) {
//     console.error("Error calculating commission:", error);
//     return res.status(500).json({ error: "Error calculating commission" });
//   }
// };

exports.calculateCommission = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Fetch direct bookings made by the user
    const directBookings = await Booking.findAll({
      where: { booked_by: userId, payment_status: "paid" },
    });

    const directSalesTotal = directBookings.reduce(
      (acc, booking) => acc + booking.subTotal,
      0
    );

    // Step 2: Fetch level 1 referrals (users referred by the current user)
    const level1Referrals = await User.findAll({
      where: { referrerId: userId },
    });

    const l1Bookings = await Booking.findAll({
      where: {
        booked_by: level1Referrals.map((ref) => ref.id),
        payment_status: "paid",
      },
    });

    const l1SalesTotal = l1Bookings.reduce(
      (acc, booking) => acc + booking.subTotal,
      0
    );

    // Step 3: Fetch level 2 referrals (users referred by level 1 referrals)
    const level2Referrals = await User.findAll({
      where: { referrerId: level1Referrals.map((ref) => ref.id) },
    });

    const l2Bookings = await Booking.findAll({
      where: {
        booked_by: level2Referrals.map((ref) => ref.id),
        payment_status: "paid",
      },
    });

    const l2SalesTotal = l2Bookings.reduce(
      (acc, booking) => acc + booking.subTotal,
      0
    );

    // Step 4: Calculate commissions
    const directCommission = directSalesTotal * 0.05; // 5% commission on direct sales
    const l1Commission = l1SalesTotal * 0.03; // 3% commission on L1 sales
    const l2Commission = l2SalesTotal * 0.02; // 2% commission on L2 sales

    let totalCommission = directCommission + l1Commission + l2Commission;

    // Step 5: Check withdrawals for the user
    const totalWithdrawals = await Withdrawal.sum("amount", {
      where: { userId },
    });

    // Subtract withdrawn amount from total commission
    const availableCommission = (
      totalCommission - (totalWithdrawals || 0)
    ).toFixed(2);

    // Step 6: Return the commission data
    return res.json({
      userId,
      totalSales: {
        directSales: directSalesTotal,
        level1Sales: l1SalesTotal,
        level2Sales: l2SalesTotal,
      },
      totalCommission: totalCommission.toFixed(2),
      totalWithdrawals: totalWithdrawals || 0,
      availableCommission,
      breakdown: {
        directCommission: directCommission.toFixed(2),
        l1Commission: l1Commission.toFixed(2),
        l2Commission: l2Commission.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error calculating commission:", error);
    return res.status(500).json({ error: "Error calculating commission" });
  }
};

// exports.calculateCommission = async (req, res) => {
//   try {
//     const { userId } = req.params; // User for whom commissions are calculated

//     // Fetch direct sales (sales made directly by this user)
//     const directSalesData = await Commission.findAll({
//       where: { userId, type: 'direct' }, // Direct sales
//     });

//     // Calculate total sales and commission from direct sales
//     const directSalesTotal = directSalesData.reduce((acc, record) => acc + record.amount, 0);
//     const directCommission = directSalesTotal * 0.05; // 5% commission on direct sales

//     // Fetch Level 1 referrals (users referred by this user)
//     const level1Referrals = await User.findAll({
//       where: { referrerId: userId }, // Users referred directly by this user
//     });

//     // Fetch Level 1 sales (sales made by L1 referrals)
//     const l1SalesData = await Commission.findAll({
//       where: {
//         userId: level1Referrals.map(ref => ref.id),
//         type: 'direct',
//       },
//     });

//     // Calculate total sales and commission from L1 referrals
//     const l1SalesTotal = l1SalesData.reduce((acc, record) => acc + record.amount, 0);
//     const l1Commission = l1SalesTotal * 0.03; // 3% commission on L1 sales

//     // Fetch Level 2 referrals (users referred by L1 referrals)
//     const level2Referrals = await User.findAll({
//       where: { referrerId: level1Referrals.map(ref => ref.id) }, // Users referred by L1
//     });

//     // Fetch Level 2 sales (sales made by L2 referrals)
//     const l2SalesData = await Commission.findAll({
//       where: {
//         userId: level2Referrals.map(ref => ref.id),
//         type: 'direct',
//       },
//     });

//     // Calculate total sales and commission from L2 referrals
//     const l2SalesTotal = l2SalesData.reduce((acc, record) => acc + record.amount, 0);
//     const l2Commission = l2SalesTotal * 0.02; // 2% commission on L2 sales

//     // Calculate total commission
//     const totalCommission = (directCommission + l1Commission + l2Commission).toFixed(2);

//     // Return the calculated commission breakdown
//     return res.json({
//       userId,
//       totalSales: {
//         directSales: directSalesTotal,
//         level1Sales: l1SalesTotal,
//         level2Sales: l2SalesTotal,
//       },
//       totalCommission,
//       breakdown: {
//         directCommission,
//         l1Commission,
//         l2Commission,
//       },
//     });
//   } catch (error) {
//     console.error('Error calculating commission:', error);
//     return res.status(500).json({ error: 'Error calculating commission' });
//   }
// };

exports.getReferrals = async (req, res) => {
  const userId = req.params.userId;

  try {
    const referrals = await User.findAll({
      where: { referrerId: userId },
    });

    return res.status(200).json(referrals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching referrals" });
  }
};

exports.getAllcommission = async (req, res) => {
  try {
    const findallcommission = await Commission.findAll();
    if (!findallcommission) {
      res.status(400).json({
        message: "Commission not found",
      });
      return;
    }
    if (findallcommission) {
      res.status(200).json(findallcommission);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching referrals" });
  }
};
// exports.withdraw = async (req, res) => {
//   const { userId, amount } = req.body;

//   try {
//     // Check if the user has a bank account
//     const bankAccount = await BankAccount.findOne({ where: { userId } });
//     if (!bankAccount) {
//       return res.status(400).json({ message: "No bank account details found. Please add bank account information before requesting a withdrawal." });
//     }

//     // Fetch all commission records for the specified user
//     const userCommissions = await Commission.findAll({ where: { userId } });

//     // Calculate the total available commission
//     const totalCommission = userCommissions.reduce((sum, commission) => sum + commission.amount, 0);

//     // Check if the user has enough commission balance
//     if (totalCommission < amount) {
//       return res.status(400).json({ message: "Insufficient commission balance." });
//     }

//     // Deduct the amount from the user's commission records
//     let remainingAmount = amount;
//     for (let commission of userCommissions) {
//       if (remainingAmount <= 0) break;

//       if (commission.amount >= remainingAmount) {
//         // Deduct remaining amount and update the record
//         commission.amount -= remainingAmount;
//         await commission.save();
//         remainingAmount = 0;
//       } else {
//         // Deduct the whole commission amount and set remaining amount
//         remainingAmount -= commission.amount;
//         commission.amount = 0;
//         await commission.save();
//       }
//     }

//     return res.status(200).json({ message: "Withdrawal successful.", remainingBalance: totalCommission - amount });
//   } catch (error) {
//     console.error("Withdrawal Error:", error);
//     return res.status(500).json({ message: "An error occurred while processing your withdrawal request." });
//   }
// };
