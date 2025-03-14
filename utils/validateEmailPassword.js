// Description: Common utility to validate email and password.

exports.validateEmail = function(email) {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
    
}
exports.validatePassword = function(password) {
    // ensures that the password contains at least one digit, one lowercase letter, one uppercase letter, and is at least 8 characters long.
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
    
};

