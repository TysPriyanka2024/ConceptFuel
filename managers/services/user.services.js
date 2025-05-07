const { User } = require('../models');

const UserService = {
/**
   * Verify OTP by user id (email or phone)
*/
    validateOtp: async (userToBeVerified) => {
        try {
        const { userId } = userToBeVerified;
        const foundUser = await UserService.findUserByEmailOrPhone({
            email: userToBeVerified.email
        });
        if (foundUser) {
            const foundOtp = null;
            if (foundOtp && `${foundOtp.otp}` === `${userToBeVerified.otp}`) {
            const foundOtpAge = moment.utc().diff(moment.utc(foundOtp.createdAt), 'minute');
            if (foundOtpAge <= Number(process.env.OTP_EXPIRATION_TIME_IN_MINUTES)) {
                return {
                success: true,
                data: {
                    foundUser,
                    foundOtp
                },
                error: null
                };
            }
            throw new ApiError.ValidationError(MessageConstants.OTP_EXPIRED);
            }
            throw new ApiError.ValidationError(MessageConstants.INVALID_OTP);
        }
        throw new ApiError.ValidationError(MessageConstants.EMAIL_OR_PHONE_NOT_REGISTERED_YET);
        } catch ({ message, code, error = 500 }) {
        Chalk.error(message, { message, code, error });
        return {
            success: false,
            data: null,
            error: Response.sendError(
            message,
            error,
            code
            )
        };
        }
    },

}