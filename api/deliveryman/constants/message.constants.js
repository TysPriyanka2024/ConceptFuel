module.exports = Object.freeze({

    // common
    SUCCESS: 'Data updated successfully',
    ACCESS_DENIED_ERROR: 'Access denied error',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED_ERROR: 'You are unauthorized',
    FORBIDDEN: 'You are authenticated but do not have access to what you are trying to do',
    NOT_FOUND: 'The resource you are looking for does not exist',
    RESOURCE_EXISTS: 'The resource you are requesting already exists',
    EMAIL_ALREADY_REGISTERED: 'Email is already registered',
    PHONE_ALREADY_REGISTERED: 'Phone number is already registered',
    PASSWORD_RESET: 'Password changed successfully',
    INVALID_EMAIL_OR_PHONE: '^Invalid email',
    EMAIL_OR_PHONE_NOT_REGISTERED_YET: 'Email is not registered yet',
    NO_USER_FOUND: 'No user found with these details',
    NOT_LOGGED_IN: 'No user found, Please Login First',
    INVALID_PASSWORD: 'Invalid password',
    NOT_A_VALID_KEY: '%{value} is not valid',
    INVALID: 'Not Valid',
    INVALID_OTP: 'Invalid OTP',
    OTP_EXPIRED: 'Otp has been expired',
    NOT_A_VALID_KEY: '%{value} is not valid',
    ENTER_VALUE: 'Please enter the %{value} ',

    // customer management
    USER_LOGGED_IN: 'User has been successfully logged in',
    USER_LOGGED_OUT: 'User has been successfully logged out',
    USER_REGISTERED_SUCCESSFULLY: 'User has been registered successfully',
    USER_INACTIVE: 'Your account is not active or approved. Please contact your administrator',
    USER_UPDATED_INACTIVE: 'User account is marked inactive',
    USER_PROFILE_UPDATED: 'User profile has been updated',
    USER_PROFILE_FETCHED: 'User profile fetched successfully',
    USERS_FETCHED: 'Users fetched successfully',
    USERS_WITHOUT_CARD_FETCHED: 'Users without cards have been fetched successfully',
    USER_ACCOUNT_DETAILS_FETCHED: 'User account details fetched successfully',
    USER_NOT_PRESENT: 'User does not Exist',
    USER_STATUS_UPDATED: 'User status has been updated successfully',

    // dashboard
    DASHBOARD_COUNTS_FETCHED: 'Dashboard counts fetched successfully',

    // Notifications
    NOTIFICATIONS_FETCHED: 'Notifications have been fetched successfully',
    NOTIFICATION_READ: 'Notification has been marked read successfully',

    // ADMIN
    ADMIN_PROFILE_UPDATED: 'Admin profile has been updated',

    DATA_FETCHED_SUCCESSFULLY: 'Data fetched successfully',
    NO_DATA_FOUND: 'No user found with these details',
    PASSWORD_UPDATED: 'Password updated successfully',
    DRIVER_NOT_APPROVED: 'Driver is not approved yet',
    DRIVER_STATUS_UPDATED: 'Driver status has been updated successfully',

    // Permission message
    NOT_PERMISSION_ERROR: 'You don\'t have permission to access this module',
    MODULE_NOT_ASSIGN_ERROR: 'Module not assigned to you',

    // user management
    ACTIVE: '1',

    WAREHOUSE_NOT_PRESENT: 'Warehouse does not Exist',
    LOCATION_NOT_PRESENT: 'Location does not Exist',
    TRANSFER_NOT_PRESENT: 'Internal transfer does not Exist',

    TRANSFER_ALREADY_REGISTERED: 'Internal transfer is already registered',
    TRANSFER_ADD_SUCCESSFULLY: 'Internal transfer added successfully',
    TRANSFER_UPDATE_SUCCESSFULLY: 'Internal transfer updated successfully',
    TRANSFER_DELETED: 'Internal transfer deleted successfully',
    TRANSFER_ALREADY_COMPLETED: 'Internal transfer is already completed',
    TRANSFER_COMPLETED: 'Internal transfer completed successfully',

    DESTINATION_LOCATION_ID_SHOULD_NOT_BE_SAME: '^Destination location should not be same as source location',
    NUM_OF_PRODUCTS_SHOULD_NOT_BE_SAME_LESS_THAN_NUM_OF_WORKERS: 'Number of products should be equal or greater than number of workers.',
    NUM_OF_WORKERS_SHOULD_NOT_BE_SAME_LESS_THAN_NUM_OF_PRODUCTS: 'Number of workers should be equal or less than number of products.',
    ISSUE_IN_PRODUCT_SELECTION: 'Selected products are not available in product stocks',
    NUM_OF_WORKERS_SHOULD_BE_SAME_OR_LESS_THAN_NUM_OF_INVOICES: 'Number of workers should be equal or less than number of invoices.',

    JOB_CANNOT_UPDATED: 'You can\'t update this job because job has started',
    JOB_CANNOT_DELETED: 'You can\'t delete this job because job has started',

    INWARD_NOT_PRESENT: 'Inward detail does not Exist',
    INWARD_JOB_CREATED: 'Inward job created successfully',
    SCHEDULE_SHOULD_BE_GREATER_THAN_CURRENT: 'Schedule date should be greater than current date',
    REQUEST_FORMAT_NOT_VALID: 'Request format is not valid',
    ASSIGN_WORKER_FORMAT_NOT_VALID: 'Assign worker format is not valid',
    PRODUCT_FORMAT_NOT_VALID: 'Product format is not valid',
    WORKER_FORMAT_NOT_VALID: 'Worker format is not valid',
    ASSIGN_ATLEAST_ONE_WORKER: 'Please assign atleast one worker',
    ASSIGN_ATLEAST_ONE_PROUCT: 'Please assign atleast one product',
    ASSIGN_WORKER_TO_ALL_PRODUCTS: 'Please assign worker to all product',

    PUTAWAY_JOB_CREATED: 'Putaway job created successfully',
    PALLET_FORMAT_NOT_VALID: 'Pallet format is not valid',
    PUTAWAY_JOB_DONE: 'Putaway job completed',
    PICKLIST_NOT_PRESENT: 'Pick List detail does not Exist',
    PICKLIST_JOB_CREATED: 'Pick List job created successfully',

    SORTLIST_NOT_PRESENT: 'Sort List detail does not Exist',
    SORTLIST_JOB_CREATED: 'Sort List job created successfully',

    //PRODUCT_DISPATCH:"Product Dispatched Sucessfully",
    PRODUCT_DISPATCH: "Product Loaded",
    //DISPATCH_JOB_DONE_SUCCESSFULLY: "Dispatch List job created succesfully",
    DISPATCH_JOB_DONE_SUCCESSFULLY: "Job completed",

    AUDIT_CREATED: 'Audit Created Successfully',
    REGION_NOT_PRESENT: 'Region does not Exist',
    REGION_FORMAT_NOT_VALID: 'Region format is not valid',
    ASSIGN_ATLEAST_ONE_REGION: 'Please assign atleast one region',
    ASSIGN_ATLEAST_ONE_PALLET: 'Please assign atleast one pallet',

    SELECT_INVOICE_FORMAT_NOT_VALID: 'Invoice format is not valid',
    SELECT_ATLEAST_ONE_INVOICE: 'Please select atleast one invoice',

    ISSUE_IN_PRODUCT_WEIGHT: 'There is some issue in product selection',
    ISSUE_IN_PALLET_WEIGHT: 'There is some issue in pallet selection',
    ISSUE_IN_PALLET_SELECT: 'Please select more pallets for products',
    PALLET_WT_SHOULD_BE_MORE_THAN_PRODUCT_WT: 'Pallet weight should be equal or more than assigned products weight',
    ASSIGN_ONE_WORKER_ONLY: 'Please assign one worker only',
    CREATE_INWARD_FIRST: 'Please create inward job first',

    BRANCH_FETCHED_SUCCESSFULLY: 'Branch fetched successfully',
    BRANCH_NOT_PRESENT: 'Branch does not Exist',
    BRANCH_NOT_IN_AREA: "We don't serve in your location",
    BRANCH_ALREADY_REGISTERED: 'Branch is already registered',
    BRANCH_ADD_SUCCESSFULLY: 'Branch added successfully',
    BRANCH_UPDATE_SUCCESSFULLY: 'Branch updated successfully',
    BRANCH_FOUND : 'Branch Found SuccessFully',
    BRANCH_DELETED: 'Branch deleted successfully',

    PRODUCT_NOT_PRESENT_IN_PICKLIST: 'No products in pick list',
    PRODUCT_NOT_PRESENT_IN_STOCK: 'Products are not available in stock',

    CATEGORY_FETCHED_SUCCESSFULLY: 'Category fetched successfully',
    CATEGORY_NOT_PRESENT: 'Category does not Exist',
    CATEGORY_ALREADY_REGISTERED: 'Category is already registered',
    CATEGORY_ADD_SUCCESSFULLY: 'Category added successfully',
    CATEGORY_UPDATE_SUCCESSFULLY: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',

    LOCATION_FETCHED_SUCCESSFULLY: 'Location fetched successfully',
    LOCATION_NOT_PRESENT: 'Location does not Exist',
    LOCATION_ALREADY_REGISTERED: 'Location is already registered',
    LOCATION_ADD_SUCCESSFULLY: 'Location added successfully',
    LOCATION_UPDATE_SUCCESSFULLY: 'Location updated successfully',
    LOCATION_DELETED: 'Location deleted successfully',

    ROUTE_FETCHED_SUCCESSFULLY: 'Route fetched successfully',
    ROUTE_NOT_PRESENT: 'Route does not Exist',
    ROUTE_ALREADY_REGISTERED: 'Route is already registered',
    ROUTE_ADD_SUCCESSFULLY: 'Route added successfully',
    ROUTE_UPDATE_SUCCESSFULLY: 'Route updated successfully',
    ROUTE_DELETED: 'Route deleted successfully',



    USER_FETCHED_SUCCESSFULLY: 'User fetched successfully',
    USER_ALREADY_REGISTERED: 'User is already registered',
    USER_ADD_SUCCESSFULLY: 'User added successfully',
    USER_UPDATE_SUCCESSFULLY: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    EMP_ID_ALREADY_REGISTERED: 'Employee id is already registered',


    ORDER_NOT_PRESENT: 'Order does not Exist',
    ORDER_FETCHED_SUCCESSFULLY: 'Order fetched successfully',
    ORDER_ALREADY_REGISTERED: 'Order is already placed',
    ORDER_ALREADY_Cancelled: 'Order is already Cancelled',
    ORDER_ADD_SUCCESSFULLY: 'Order Placed successfully',
    ORDER_UPDATE_SUCCESSFULLY: 'Order updated successfully',
    ORDER_DELETED: 'Order Cancelled successfully',
    ORDER_NOT_FOUND: 'No orders placed',
    ORDER_NOT_DELETE: 'Orders Cannot Be Deleted Now ',

    PRODUCT_FETCHED_SUCCESSFULLY: 'Product fetched successfully',
    PRODUCT_NOT_PRESENT: 'Product does not Exist',
    PRODUCT_ALREADY_REGISTERED: 'Product is already registered',
    PRODUCT_CODE_ALREADY_REGISTERED: 'Product sku code is already registered',
    PRODUCT_BAR_CODE_ALREADY_REGISTERED: 'Product bar code is already registered',
    PRODUCT_ADD_SUCCESSFULLY: 'Product added successfully',
    PRODUCT_UPDATE_SUCCESSFULLY: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    SELECT_CATEGORY_FORMAT_NOT_VALID: 'Category format is not valid',
    DISPATCH_TRIP_STATUS_UPDATED: 'Trip status updated successfully',


    USER_NOT_FOUND: 'User notification created successfully',
    USER_NOTIFICATION_ADDED_SUCCESSFULLY: 'User notification created successfully',
    USER_NOTIFICATION_REQUEST_ADD_ERROR: 'Error in creating User notification',
    USER_NOTIFICATIONS_FETCHED_SUCCESSFULLY: 'User Notifications fetched successfully',
    USER_NOTIFICATION_NOT_EXIST: 'User notification does not exist.',
    USER_NOTIFICATION_REQUEST_EDIT_ERROR: 'Error in updating user notification request',
    USER_NOTIFICATION_REQUEST_EDIT_SUCCESS: 'User notification request updated successfully',
    USER_NOTIFICATION_REQUEST_DELETE_SUCCESS: 'User notification request deleted successfully',
    USER_NOTIFICATION_REQUEST_DELETE_ERROR: 'Error in deleting user notification request',

    


    CART_FETCHED_SUCCESSFULLY : 'Cart data retrieved successfully',
    CART_NOT_PRESENT : 'Cart does not Exist',
    CART_ALREADY_REGISTERED : 'Cart is already registered',
    CART_ADD_SUCCESSFULLY : 'Cart added successfully',
    CART_UPDATE_SUCCESSFULLY : 'Cart updated successfully',
    CART_DELETED : 'Cart deleted successfully',
    CART_ALREADY_EXIST : 'Cart already exist',
    CART_NOT_FOUND : 'Cart not found',
    CART_EMPTY : 'Cart is empty',


    ADDRESS_FETCHED_SUCCESSFULLY : 'Addresses retrieved successfully',
    ADDRESS_NOT_PRESENT : 'Address not found, Please Add New Address',
    ADDRESS_UDPATED_SUCCESSFULLY : 'Address updated successfully',
    ADDRESS_DELETED_SUCCESSFULLY : 'Address Deleted successfully'

});