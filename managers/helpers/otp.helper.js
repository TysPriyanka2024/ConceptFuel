module.exports = { 
  generateOTP : () => {
    return Math.floor(1000 + Math.random() * 9000);
  },
  sendOTPToUser : (phone, otp) => {
    console.log(`OTP for ${phone}: ${otp}`);
  },
};
  