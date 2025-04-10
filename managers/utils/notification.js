module.exports = Object.freeze({
    // CUSTOMER
    CUSTOMER: Object.freeze({
      bookingPlace: {
        title: 'Booking Created!',
        body: 'A new Booking has created.'
        
      },
      bookingAccepted: {
        title: 'Booking Accepted!',
        body: 'Your Booking is accepted by driver.'
      },
      bookingCompleted: {
        title: 'Booking Completed!',
        body: 'Your Booking is completed by driver.'
      },
      bookingUndelivered: {
        title: 'Booking Undelivered!',
        body: 'Your Booking is undelivered by driver.'
      },
      bookingInProgress: {
        title: 'Booking In Progress!',
        body: 'Your Booking is in progress.'
      },
      bookingOutForDelivery: {
        title: 'Booking Out For Delivery!',
        body: 'Your Booking is Out For Delivery.'
      },
      tripQuotationCreated: {
        title: 'Trip Quotation',
        body: 'Trip quotation generated for the user'
      },
      tripQuotationUpdated: {
        title: 'Trip Quotation',
        body: 'Trip quotation updated for the user'
      },
      tripQuotationAccepted: {
        title: 'Trip Quotation',
        body: 'Trip quotation is accepted by the user'
      },
      tripQuotationRejected: {
        title: 'Trip Quotation',
        body: 'Trip quotation is rejected by the user'
      },
      userContractCreated: {
        title: 'User Contract',
        body: 'User contract generated'
      },
      userContractUpdated: {
        title: 'User Contract',
        body: 'User contract updated'
      },
      userContractAccepted: {
        title: 'User Contract',
        body: 'User contract is accepted'
      },
      userContractRejected: {
        title: 'User Contract',
        body: 'User contract is rejected'
      }
    }),
    // DRIVER
    DRIVER: Object.freeze({
      bookingPlace: {
        title: 'New Booking!',
        body: 'A new Booking has arrived, Please Accept it now.'
      },
      bookingCancelled: {
        title: 'Booking Cancelled!',
        body: 'Booking is cancelled by customer.'
      }
    }),
    TRANSPORTMANAGER : Object.freeze({
      newTripRequestCreated: {
        notification_type: 'notification_newtriprequest'
      },
      tripRequestUpdated: {
        notification_type: 'notification_updatetriprequest'
      }
    }),
    SPOC : Object.freeze({
      pickingComplete: {
        notification_type: 'notification_pickingcomplete'
      },
      sortingComplete: {
        notification_type: 'notification_sortingcomplete'
      },
      dispatchComplete: {
        notification_type: 'notification_dispatchcomplete'
      },
      inwardComplete: {
        notification_type: 'notification_inwardcomplete'
      },
      tripCreated: {
        notification_type: 'notification_tripcreated'
      },
      putawayComplete: {
        notification_type: 'notification_putawaycompleted'
      }
    }),
    WAREHOUSE: Object.freeze({
      dispatchlistCreated: {
        notification_type: 'notification_dispatchlistcreated'
      }
    }),
    CLIENT: Object.freeze({
      contractCreated: {
        notification_type: 'notification_contractcreated'
      },
      contractAccepted: {
        notification_type: 'notification_contractaccepted'
      },
      contractRejected: {
        notification_type: 'notification_contractrejected'
      }
    }),
    WORKER: Object.freeze({
      picklistCreated: {
        notification_type: 'notification_picklistcreated'
      },
      sortlistCreated: {
        notification_type: 'notification_sortlistcreated'
      },
      inwardjobCreated: {
        notification_type: 'notification_inwardjobcreated'
      },
      putawayjobCreated: {
        notification_type: 'notification_inwardjobcreated'
      },
      productauditCreated: {
        notification_type: 'notification_productauditcreated'
      },
      clientauditCreated: {
        notification_type: 'notification_clientauditcreated'
      },
      dispatchJobCreated: {
        notification_type: 'notification_dispatchjobcreated'
      },
      transferCreated: {
        notification_type: 'notification_transfercreated'
      },
      locationauditCreated: {
        notification_type: 'notification_locationauditcreated'
      },
    })
  });
  