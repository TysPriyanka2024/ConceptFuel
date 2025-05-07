const axios = require("axios");
const token = 'EAAVOmhbOBCABOzqEoVWApgi6VrILRPDpgU9BZBss2AJ4DC0ZBZCk3S2xIikXyIH9hiOMZADxpHaZAf68YFEWZB5PMKN8Nfxc9nZCfZCeGKJkcFsTLAaMzAh280matbrk9IZBEptZB3p4PkaZATcqgHVxEzZCBybzumC7UlQ6gVdlUv5NE9Ol2qqHzNkAZB2fB2OZA4MLaRrZAZBF3h9G4Pchd4ke';

module.exports = {
  elseCase : async (description, phone_number) => {
    try {
      console.log(description)
      const response = await axios.post(
        `https://webhook.joshfuels.com/webhook/`,
            {
              messageAck : "Message Needs to be sent",
              type : description.type,
              phone_number : phone_number,
              description : description,
              phone_number_id : "155621414308796",
              object: 'whatsapp_business_account',
          },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log('Message sent successfully:', response.data);

      return { success: true};
    } catch (error) {
      console.error(error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        return { success: false, data: error.response.data };
      } else {
        return { success: false, error: 'An unexpected error occurred' };
      }
    }                      
  }
}