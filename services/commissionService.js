const {Commission, Withdrawal} = require("../models");
// const updateZoho = require("../services/zoho_commission"); // Zoho integration service

// /**
//  * Deducts a refund amount from a user's total commission.
//  *
//  * @param {number} userId - The ID of the user whose commission is to be deducted.
//  * @param {number} refundedAmount - The amount to be deducted.
//  * @param {string} vendorCreditId - Optional vendor credit ID associated with the refund.
//  * @returns {Promise<Object>} - The updated commission record.
//  * @throws {Error} - If commission record is not found or any other issue occurs.
//  */
// async function deductRefund(
//   userId,
//   refundedAmount,
//   vendorCreditId = null,
//   RefundId = null
// ) {
//   console.log("----inside service ", userId, refundedAmount, vendorCreditId);
//   try {
//     // Find the commission record for the user
//     const commission = await Commission.findOne({ where: { userId } });

//     if (!commission) {
//       throw new Error("Commission record not found for this user");
//     }

//     // Deduct the refunded amount from totalCommission
//     // commission.totalCommission -= refundedAmount;

//     // Ensure commission doesn't go below zero
//     commission.withDrawn = Math.max(
//       0,
//       commission.totalCommission - refundedAmount
//     );
   
//     // Update vendor credit ID if provided
//     if (vendorCreditId) {
//       commission.vendor_credit_id =
//         commission.vendor_credit_id || vendorCreditId;
//     }

//     commission.vendor_credit_refund_id = RefundId;
//     commission.status = "withdrawal";
//     // Save the updated commission
//     await commission.save();

//     console.log(
//       `Refund of AED${refundedAmount} deducted from user ${userId}'s total commission`
//     );

//     // Optionally, log the refund to Zoho or perform other actions
//     // await updateZoho({
//     //   userId,
//     //   deductedAmount: refundedAmount,
//     //   action: 'Refund Deduction',
//     // });

//     // return commission;
//   } catch (error) {
//     console.error("Error deducting refund:", error);
//     throw error;
//   }
// }

// module.exports = {
//   deductRefund,
// };


const { Op } = require("sequelize");

async function deductRefund(userId, refundedAmount, vendorCreditId = null, refundId = null) {
  try {
    const commissions = await Commission.findAll({
      where: { userId, status: { [Op.ne]: "withdrawn" } },
      order: [["createdAt", "ASC"]],
    });

    if (commissions.length === 0) {
      throw new Error("No commission records available for withdrawal.");
    }

    const totalAvailable = commissions.reduce(
      (sum, record) => sum + parseFloat(record.totalCommission),
      0
    );

    if (totalAvailable < refundedAmount) {
      throw new Error("Insufficient commission for the requested withdrawal.");
    }

    let remainingAmount = refundedAmount;

    for (const commission of commissions) {
      if (remainingAmount <= 0) break;

      const currentCommission = parseFloat(commission.totalCommission);

      if (currentCommission > remainingAmount) {
        // Partial deduction
        await commission.update({
          totalCommission: currentCommission - remainingAmount,
        });
        remainingAmount = 0;
      } else {
        // Fully utilize this commission record
        await commission.update({
          totalCommission: 0,
          status: "withdrawn",
        });
        remainingAmount -= currentCommission;
      }
    }

    const withdrawalRecord = await Withdrawal.create({
      userId,
      amount: refundedAmount,
      vendorCreditId,
      refundId,
      description: "Partial withdrawal processed from commission",
    });

    const updatedSum = await Commission.sum("totalCommission", {
      where: { userId, status: { [Op.ne]: "withdrawn" } },
    });
    await Commission.update({ sum_total: updatedSum || 0 }, { where: { userId } });

    console.log(`Withdrawal of AED${refundedAmount} successfully processed for user ${userId}`);

    return withdrawalRecord;
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    throw error;
  }
}

module.exports = {
  deductRefund,
};
