const { default: axios } = require("axios");
const { Booking, User, BankAccount } = require("../models"); // Make sure Booking and User are imported correctly
const { Commission } = require("../models");

exports.calculateCommission = async (userId) => {
  console.log(userId, "id");
  try {
    //   const { userId } = req.params; // User ID to calculate commissions for

    // Fetch direct bookings for the user
    const directBookings = await Booking.findAll({
      where: { booked_by: userId, payment_status: "paid" },
    });

    // Get existing commissions for the user
    const existingCommissions = await Commission.findAll({ where: { userId } });
    const existingBookingIds = existingCommissions.map((c) => c.bookingId);

    // Filter out already recorded bookings
    const newDirectBookings = directBookings.filter(
      (booking) => !existingBookingIds.includes(booking.id)
    );

    const directSalesTotal = newDirectBookings.reduce(
      (acc, booking) => acc + booking.subTotal,
      0
    );

    // Fetch level 1 referrals (users referred by this user)
    const level1Referrals = await User.findAll({
      where: { referrerId: userId },
    });
    const l1ReferralIds = level1Referrals.map((ref) => ref.id);

    // Fetch bookings for level 1 referrals
    const l1Bookings = await Booking.findAll({
      where: { booked_by: l1ReferralIds, payment_status: "paid" },
    });
    const newL1Bookings = l1Bookings.filter(
      (booking) => !existingBookingIds.includes(booking.id)
    );
    const l1SalesTotal = newL1Bookings.reduce(
      (acc, booking) => acc + booking.subTotal,
      0
    );

    // Fetch level 2 referrals (users referred by level 1 referrals)
    const level2Referrals = await User.findAll({
      where: { referrerId: l1ReferralIds },
    });
    const l2ReferralIds = level2Referrals.map((ref) => ref.id);

    // Fetch bookings for level 2 referrals
    const l2Bookings = await Booking.findAll({
      where: { booked_by: l2ReferralIds, payment_status: "paid" },
    });
    const newL2Bookings = l2Bookings.filter(
      (booking) => !existingBookingIds.includes(booking.id)
    );
    const l2SalesTotal = newL2Bookings.reduce(
      (acc, booking) => acc + booking.subTotal,
      0
    );

    // Calculate commissions with safe handling
    const totalDirectCommission = Number(directSalesTotal * 0.10 || 0);
    const totalL1Commission = Number(l1SalesTotal * 0.03 || 0);
    const totalL2Commission = Number(l2SalesTotal * 0.02 || 0);
    const totalCommission = Number(
      (totalDirectCommission + totalL1Commission + totalL2Commission).toFixed(2)
    );

    // Prepare new commission records
    const newCommissions = [
      ...newDirectBookings.map((booking) => ({
        userId,
        bookingId: booking.id,
        directSales: booking.subTotal,
        level1Sales: 0,
        level2Sales: 0,
        directCommission: booking.subTotal * 0.10,
        l1Commission: 0,
        l2Commission: 0,
        totalCommission: booking.subTotal * 0.10,
      })),
      ...newL1Bookings.map((booking) => ({
        userId,
        bookingId: booking.id,
        directSales: 0,
        level1Sales: booking.subTotal,
        level2Sales: 0,
        directCommission: 0,
        l1Commission: booking.subTotal * 0.03,
        l2Commission: 0,
        totalCommission: booking.subTotal * 0.03,
      })),
      ...newL2Bookings.map((booking) => ({
        userId,
        bookingId: booking.id,
        directSales: 0,
        level1Sales: 0,
        level2Sales: booking.subTotal,
        directCommission: 0,
        l1Commission: 0,
        l2Commission: booking.subTotal * 0.02,
        totalCommission: booking.subTotal * 0.02,
      })),
    ];

    // Save new commissions to the database
    if (newCommissions.length > 0) {
      await Commission.bulkCreate(newCommissions, { validate: true });
      console.log("New commission records created.");
    } else {
      console.log("No new commission records to create.");
    }

    // const totalWithdrawals = existingCommissions.reduce(
    //   (acc, c) => acc + (c.type === "withdrawal" ? c.amount : 0),
    //   0
    // );
    // const availableCommission = totalCommission - totalWithdrawals;

    // Prepare payload for Zoho API
    const payload = {
      userId,
      totalSales: {
        directSales: directSalesTotal,
        level1Sales: l1SalesTotal,
        level2Sales: l2SalesTotal,
      },
      totalCommission: totalCommission.toFixed(2),
      // totalWithdrawals: totalWithdrawals.toFixed(2),
      // availableCommission: availableCommission.toFixed(2),
      breakdown: {
        directCommission: totalDirectCommission.toFixed(2),
        l1Commission: totalL1Commission.toFixed(2),
        l2Commission: totalL2Commission.toFixed(2),
      },
    };

    // Send data to Zoho
    const zohoApiUrl = 'https://www.zohoapis.com/crm/v2/functions/commissions_api/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893';

    await axios.post(zohoApiUrl, payload);

    console.log("Data sent to Zoho:", payload);

    return {
      directSalesTotal,
      payload,
      l1SalesTotal,
      l2SalesTotal,
      totalCommission,
    };
    // Fetch updated commission records for the user
    //   const allCommissions = await Commission.findAll({ where: { userId } });

    //   // Respond with all commissions for the user
    //   return res.json({
    //     message: "Commission calculated successfully.",
    //     userId,
    //     totalSales: {
    //       directSales: directSalesTotal,
    //       level1Sales: l1SalesTotal,
    //       level2Sales: l2SalesTotal,
    //     },
    //     totalCommission,
    //     breakdown: {
    //       directCommission: totalDirectCommission,
    //       l1Commission: totalL1Commission,
    //       l2Commission: totalL2Commission,
    //     },
    //     commissions: allCommissions, // Include all commissions in the response
    //   });
  } catch (error) {
    console.error("Error calculating commission:", error);
    throw new Error("Error calculating commission");
  }
};
