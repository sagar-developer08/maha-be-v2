const express = require("express");
const { deductRefund } = require("../services/commissionService");
const router = express.Router();

router.post("/webhook/zoho", async (req, res) => {
  try {
    const event = req.body;

    console.log('====',event)
    const userId = event.cf_accounts_id ;
    const refundedAmount = event.amount_fcy;
    // const refundedAmount = parseFloat(
    //   event.vendor_credit_refunds[0].amount_fcy
    // ); // The refunded amount
    const vendor_credit_id = event.vendor_credit_id;
    const RefundId = event.vendor_credit_refund_id;
    

    console.log('--insdie webhook',userId,refundedAmount,RefundId,vendor_credit_id)
    // Call the method to deduct the refund from the commission
    const updatedCommission = await deductRefund(
      userId,
      refundedAmount,
      vendor_credit_id,
      RefundId
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Refund processed and commission updated",
        updatedCommission
      });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process refund" });
  }
});

// router.post('/webhook/zoho/
module.exports = router;
