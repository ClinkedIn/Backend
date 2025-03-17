// const bodyParser = require('body-parser');
// const { check, validationResult } = require('express-validator');
require("dotenv").config();
const axios = require("axios");

exports.verifyCaptcha = async (recaptchaToken) => {
  // Verify the reCAPTCHA response with Google
  const verificationURL = "https://www.google.com/recaptcha/api/siteverify";
  const response = await axios.post(verificationURL, null, {
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: recaptchaToken,
    },
  });

  // Check if verification was successful
  return response.data.success;
};
