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
                shipping: shipping, // from booking body
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