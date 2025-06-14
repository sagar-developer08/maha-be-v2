const { default: axios } = require("axios");
const { User } = require("../models");
const GiftCard = require("../models/giftCard"); // Import your GiftCard model

// Create a new gift card
exports.createGiftCard = async (req, res) => {
  try {
    const { code, value, currency, expirationDate, issuedTo } = req.body;
    const giftCard = await GiftCard.create({ code, value, balance: value, currency, expirationDate, issuedTo });
    // await giftCard.setUser(issuedTo);
    res.status(201).json(giftCard);
  } catch (error) {
    res.status(500).json({ message: "Error creating gift card", error });
  }
};

// Get a gift card by ID
exports.getGiftCard = async (req, res) => {
  try {
    const giftCard = await GiftCard.findByPk(req.params.id);
    if (giftCard) {
      res.json(giftCard);
    } else {
      res.status(404).json({ message: "Gift card not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving gift card", error });
  }
};

// Get all gift cards
exports.getAllGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.findAll();
    res.json(giftCards);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving gift cards", error });
  }
};

// Update a gift card by ID
exports.updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const giftCard = await GiftCard.findByPk(id);

    if (giftCard) {
      await giftCard.update(updates);
      res.json(giftCard);
    } else {
      res.status(404).json({ message: "Gift card not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating gift card", error });
  }
};

// Delete a gift card by ID
exports.deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findByPk(id);

    if (giftCard) {
      await giftCard.destroy();
      res.json({ message: "Gift card deleted successfully" });
    } else {
      res.status(404).json({ message: "Gift card not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting gift card", error });
  }
};



exports.checkoutgiftCard = async (req, res) => {
  try {
      const { id,issuedBy,issuedTo,subTotal } = req.body;  
      const giftCard = await GiftCard.findByPk(id);
      if (!giftCard) {
          return res.status(404).json({ error: 'Gift card not found' });
      }
      const cartPayload = {
          cartObject: {
            store: {
              name: "MAHABalloons",
              url: "https://storeurl.com",
              logo: "https://storeurl.com/logo.png",
              platformUuid: "713fcbdd-a27d-44c2-9916-68e1be7956ed",
            },
            cart: {
              subTotal: subTotal, // from booking body
              // shipping: shipping, // from booking body
              currency: "USD",
              country: "US",
              items: [
                {
                  title: "Sample Product Title",
                  description: "Sample Product long description",
                  price: 50.0,
                  sku: "product_sku",
                  productId:giftCard.id,
                  variantId: "product_variant_id",
                  url: "https://storeurl.com/item1",
                  image: "https://storeurl.com/item1.jpg",
                  quantity: 2,
                  variantOptions: ["Size: M, Color: Red"],
                  zeroPay: false,
                },
              ], // Assuming items array is passed from body
              extra: {
                bookingId: giftCard.id,
                issuedBy:issuedBy,
                issuedTo:issuedTo,    
              //   slotId: slotId,
              //   tourId: tourId,
                // Storing booking ID as part of extra metadata
              //   ...bookingDetails, // If you have any extra data
              },
            },
          },
        };
    
        const cartResponse = await axios.post(
          "https://dev-api.strabl.com/v2/public/api/cart/",
          cartPayload
        );
        console.log("Cart response:", cartResponse.data.data.cartId);
    
        if (cartResponse.status === 200 || cartResponse.status === 201) {
          // Cart created successfully, decrement slots
      
          return res.status(201).json({
          //   booking,
            cart: cartResponse.data, // Return cart details along with booking
            giftCard,
          });
        } else {
          // If cart creation fails, send an error response
          return res.status(500).json({ error: "Failed to create cart" });
        }
      // res.status(200).json(giftCard);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}