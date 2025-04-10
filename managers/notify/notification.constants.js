module.exports = Object.freeze({
    OrderCancelledNotfiy : (orderId, status, Name) => {
        const successMessages = [
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nWe're sorry to hear that you've cancelled your order *(${orderId}.)* If you have any concerns, please let us know.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nOrder *(${orderId})* cancellation successful. If you have any feedback, feel free to share it with us.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nYour order *(${orderId})* has been cancelled as per your request. We hope to serve you better next time.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nCancellation confirmed! Order *(${orderId})* won't be processed. If you have questions, reach out to us.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nWe've received your cancellation request for order *(${orderId}.)* Let us know if there's anything we can do for you.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nCancelled! Your order *(${orderId})* won't proceed. If you have any concerns, don't hesitate to get in touch.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nSorry to see you go! Order *(${orderId})* cancellation successful. If you change your mind, we're here to help.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nOrder *(${orderId})* cancellation complete. If you have any issues or need assistance, feel free to reach out.`
            },
            {
                title: `Order ${status} !`,
                body: `Hi ${Name},\n\nCancellation confirmed for order *(${orderId}.)* If you have feedback or need further assistance, let us know.`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },
    PaymentSuccessNotify : (orderId, status, Name) => {
        const successMessages = [
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nPayment for order *(${orderId})* was successful! 🎉`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nCongratulations! Payment for your order *(${orderId})* has been processed!`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nPayment for order *(${orderId})* has been successfully received.`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nThank you! Payment for your order *(${orderId})* was successful!`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nSuccess! Your payment for order *(${orderId})* has been confirmed.`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },
    PaymentFailedNotify : (orderId, status, Name) => {
        const successMessages = [
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nPayment for order *(${orderId})* failed. Please try again.`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nOops! Payment for your order *(${orderId})* was not successful.`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nPayment processing for order *(${orderId})* encountered an error.`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nWe're sorry, but payment for order *(${orderId})* could not be completed.`
            },
            {
                title: `Payment ${status} !`,
                body: `Hi ${Name},\n\nPayment for order *(${orderId})* was declined. Please check your payment details and try again.`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },
    OrderPlacedNotify : (orderId, Name) => {
        const successMessages = [
            {
                title: `Order Placed Successfully !`,
                body: `Hi ${Name},\n\nOrder *(${orderId})* placed successfully! 🎉`
            },
            {
                title: `Order Placed Successfully !`,
                body: `Hi ${Name},\n\nYour order *(${orderId})* has been confirmed!`
            },
            {
                title: `Order Placed Successfully !`,
                body: `Hi ${Name},\n\nThank you for your order *(${orderId})!* 🛍️`
            },
            {
                title: `Order Placed Successfully !`,
                body: `Hi ${Name},\n\nSuccess! Your order *(${orderId})* is on its way!`
            },
            {
                title: `Order Placed Successfully !`,
                body: `Hi ${Name},\n\nOrder *(${orderId})* received and processing.`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },
    OrderStatusNotify : (orderId, status, Name) => {
        const successMessages = [
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe wish to inform you that Order *(${orderId})* is currently ${status}, and it will promptly be delivered to your designated address.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nThis communication serves to notify you that Your order - *(${orderId})* has been ${status}. We are diligently preparing it for delivery.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nIt brings us great pleasure to inform you that Your order *(${orderId})* is now ${status}. Rest assured, it is en route to your location.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe are pleased to announce that Your order *(${orderId})* is presently ${status}. We anticipate providing you with an exceptional delivery experience.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nExciting developments are underway! Your order *(${orderId})* has been ${status}.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe are delighted to confirm the receipt of your order! Order *(${orderId})* is ${status} and will soon be dispatched to you.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe are pleased to inform you that the confirmation process for your order *(${orderId})* is now complete. It has been officially logged into our system.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe extend our gratitude for choosing to place an order with us *(${orderId}.)* It is currently ${status}, and preparations are underway.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nYour discerning choice is duly noted! Your order *(${orderId})* is ${status} and is scheduled for dispatch.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe are delighted to inform you that the items for your order *(${orderId})* are en route, following successful confirmation.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nCongratulations are in order! Your order *(${orderId})* is ${status}, and our team is diligently working on fulfilling it.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe are pleased to inform you that Your order - *(${orderId})* is currently ${status}. It will be arriving at your location shortly.`
            },
            {
                title: `Order ${status} !`,
                body: `Dear ${Name},\n\nWe are delighted to inform you that Order *(${orderId})* is ${status}! Kindly prepare to receive your selected items.`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },
    
    OrderDeliveredNotify : (orderId,newStatus, Name) => {
        const successMessages = [
            {
                title: `Order ${newStatus}!`,
                body: `Hi ${Name},\n\nYour order - *(${orderId})* has been successfully delivered. Enjoy your purchase!`
            },
            {
                title: `Order ${newStatus}!`,
                body: `Hi ${Name},\n\nCongratulations! Your order *(${orderId})* is now safely in your hands.`
            },
            {
                title: `Order ${newStatus}!`,
                body: `Hi ${Name},\n\nThank you for choosing us! Your order *(${orderId})* has reached its destination.`
            },
            {
                title: `Order ${newStatus}!`,
                body: `Hi ${Name},\n\nWe're excited to let you know that your order *(${orderId})* has been delivered securely.`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },

    TrackOrderNotify : (orderId, Name, trackingLink) => {
        const successMessages = [
            {
                title: `Order Tracking !`,
                body: `Hi ${Name},\n\nYour order - *(${orderId})* is on its way! Track its journey`
            },
            {
                title: `Order Tracking !`,
                body: `Hi ${Name},\n\nExciting news! You can now track the progress of your order *(${orderId})*.`
            },
            {
                title: `Order Tracking !`,
                body: `Hi ${Name},\n\nCurious about your order? Track it now! Follow the status of your order *(${orderId})*`
            },
            {
                title: `Order Tracking !`,
                body: `Hi ${Name},\n\nGreat news! Your order *(${orderId})* is on the way. Keep an eye on its journey by clicking`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    },
    
    AssignedDeliveryManNotify : (orderId, Name) => {
        const successMessages = [
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nDelivery Alert! Order *#${orderId}* is assigned to you. Ensure a smooth delivery experience!`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nGood news! You've been assigned Order *#${orderId}* for delivery. Get ready to make someone's day!`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nDelivery Assignment: Order *#${orderId}* is now in your hands. Make it a seamless delivery, please.`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nExciting Task Ahead: Order *#${orderId}* is yours for delivery. Thank you for your service!`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nDelivery Man, you're up! Order *#${orderId}* is assigned to you. Safe and swift delivery, please.`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nDelivery Task: Order *#${orderId}* is now under your care. Ensure it reaches its destination smoothly.`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nAssigned Delivery: Order *#${orderId}* is on your route. Your dedication to timely delivery is appreciated!`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nGreat news! Order *#${orderId}* is yours to deliver. Thank you for your commitment to our customers.`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nDelivery in Progress: Order *#${orderId}* is assigned to you. Wishing you a successful and prompt delivery.`
            },
            {
                title: `Delivery Task !`,
                body: `Hi ${Name},\n\nAttention Delivery Team: Order *#${orderId}* is now with you. Your efforts in delivering satisfaction are valued!`
            }
        ];
    
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        return successMessages[randomIndex];
    }
});


