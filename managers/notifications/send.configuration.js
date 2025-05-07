const fs = require('fs');
const path = require('path');
var FCM = require('fcm-node');
const models = require('../models')
var admin = require("firebase-admin");

module.exports = {  
  sendPushNotification: async (userIds, message) => {
    try {
        // Read Firebase configuration from the JSON file
        const jsonString = fs.readFileSync(path.join(__dirname, './FireBaseConfig.json'), 'utf8');
        const data = JSON.parse(jsonString);
        const serverKey = data.SERVER_KEY;
        const fcm = new FCM(serverKey);

        // Retrieve FCM tokens for the specified user IDs
        const pushTokens = await models.UserModel.Device.find({ user_id: { $in: userIds } });
        const regIds = pushTokens.map(token => token.fcm_token);

        if (regIds.length > 0) {
            const pushMessage = {
                registration_ids: regIds,
                content_available: true,
                mutable_content: true,
                notification: {
                    title: message.title,
                    body: message.message,
                },
            };

            // Send the push notification
            fcm.send(pushMessage, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Push notification sent. -- Success");
                }
            });
        }

    } catch (error) {
        console.log(error);
    }
},

}


