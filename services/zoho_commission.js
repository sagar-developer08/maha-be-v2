const axios = require("axios");

// const ZOHO_API_URL = "https://www.zohoapis.com/crm/v2/functions/commissions_api/actions/execute";
// const ZOHO_API_KEY = "1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893";

async function updateZoho(data) {
  try {
    const response = await axios.post(`https://www.zohoapis.com/crm/v2/functions/commissions_api/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893`, data, {
      headers: {
        // Authorization: `Zoho-oauthtoken ${ZOHO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Zoho API Response:", response.data);
  } catch (error) {
    console.error("Error updating Zoho:", error.response?.data || error.message);
  }
}

module.exports = updateZoho;
