module.exports = Object.freeze({

    // CLASSIFICATION
    CLASSIFICATION: Object.freeze({
      INTERNAL: 1,
      EXTERNAL: 2
    }),
  
    // STATUS
    STATUS: Object.freeze({
      INACTIVE: 1,
      ACTIVE: 0,
      TOBEAPPROVED: 2,
      APPROVED: 3,
      REJECTED: 4
    }),
  
    // TRIP STATUS
    TRIPSTATUS: Object.freeze({
      YETTOSTARTED: 1,
      INPROGRESS: 2,
      COMPLETED: 3
    }),
  
    // VEHICLE STATUS
    VEHICLESTATUS: Object.freeze({
      YETTOCOME: 0,
      ATWAREHOUSE: 1,
      OUTFORDELIVERY: 2,
      COMPLETED: 3
    }),
  
    // LOCATIONPOINT
    LOCATIONPOINTTYPE: Object.freeze({
      PICKPOINT: 1,
      DROPPOINT: 2,
      BOTH: 3
    }),
  
    // LOCATIONTYPE
    LOCATIONTYPE: Object.freeze({
      RETURN: 1,
      DAMAGED: 2,
      SORTING: 3,
      DISPATCH: 4,
      INWARD: 5,
      REGION: 6,
      STOCK: 7
    }),
  
    // CATEGORYTYPE
    CATEGORYTYPE: Object.freeze({
      AMBIENT: 1,
      CHILLED: 2,
      DRY: 3,
      FROZEN: 4
    }),
  
    // JOB STATUS
    JOBSTATUS: Object.freeze({
      DRAFT: 'draft',
      SAVE: 'save',
      WAITING: 'waiting',
      READY: 'ready',
      DONE: 'done',
      PENDING: 'pending',
      INPROGRESS: 'InProgress',
      COMPLETED: 'completed',
      PICKED: 'picked',
      SORTED: 'sorted',
      DISPATCHED: 'dispatched'
    }),
    
    // ORDER STATUS
    ORDERSTATUS: Object.freeze({
      PICKING: 'picking',
      PICKED: 'picked',
      SORTING: 'sorting',
      READY_FOR_DISPACH: 'readyForDispatch',
      LOADING: 'loading',
      DISPATCHED: 'dispatched'
    }),
    
    // INWARD STATUS
    INWARDSTATUS: Object.freeze({
      UNLOADING: 'unloading',
      INWARDED: 'inwarded',
      PUTAWAY: 'putaway',
      STOCKED: 'stocked'
    }),
    
    // JOB TYPES
    JOBTYPES: Object.freeze({
      INWARD: 'inward',
      PUTAWAY: 'putaway',
      PICKLIST: 'pick',
      SORTLIST: 'sort',
      DISPATCH: 'dispatch',
      AUDIT: 'audit',
      INTERNALTRANSFER: 'transfers'
    }),
  
    // PRODUCT LOGISTICS TYPES
    PRODUCTLOGISTICSTYPES: Object.freeze({
      RECEIVING: 'receiving',
      STORAGE: 'storage',
      DISPATCH: 'dispatch'
    }),
    
    // REPORT TYPES
    REPORTTYPES: Object.freeze({
      1: 'Simple Inventory Report',
      2: 'Detailed Inventory',
      3: 'Product List Report',
      4: 'Inward Report',
      5: 'Order List Report',
      6: 'Pick List Report'
    }),
    
    // SHORT PICK TYPES
    SHORTPICKTYPES: Object.freeze({
      MISSING: 'missing',
      DAMAGE: 'damage',
      EXCESS: 'excess'
    }),
  
  });
  