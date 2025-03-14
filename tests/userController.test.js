const { registerUser } = require('./controllers/userController.js');


// test('test invalid email', () => {
//     expect(registerUser({
//         "firstName":"fu",
//         "lastName": "bar",
//         "email": "ff@",
//         "password": "12345678",
//         "recaptchaResponseToken": "555"
//     }).toBe('Email not valid, Write a valid email'));
// })