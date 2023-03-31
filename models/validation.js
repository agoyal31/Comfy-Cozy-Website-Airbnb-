module.exports.registrationValidation = function ({
  firstName,
  lastName,
  email,
  password,
}) {
  //validation for firstName
  let passedValidation = true;
  let validationMessage = {};
  if (firstName.trim().length === 0) {
    passedValidation = false;
    validationMessage.firstName = "You must specify the first name";
  }
  //validation for lastname
  if (lastName.trim().length === 0) {
    passedValidation = false;
    validationMessage.lastName = "You must specify the last name";
  }
  //validation for email
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isEmail = email.match(emailRegex);
  if (!isEmail) {
    passedValidation = false;
    validationMessage.email = "Enter a valid email";
  }
  //validation for password
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
  const isPassword = password.match(passwordRegex);
  if (!isPassword) {
    passedValidation = false;
    //validationMessage.password = 'Please enter a password that is between 8 to 12 characters and contains at least one lowercase letter, uppercase letter, number and a symbol.'
    validationMessage.password = "Please enter a password";
  }
  // if(password.trim().length === 0){
  //      passedValidation = false;
  //      validationMessage.password = "Please enter a password"
  // }

  return {
    passedValidation,
    validationMessage,
  };
};

//for log-in form
module.exports.loginValidation = function ({ email, password }) {
  let isValid = true;
  let validateMessage = {};
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isEmail = email.match(emailRegex);
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
  const isPassword = password.match(passwordRegex);
  //to check whether email is filled
  if (email.trim().length === 0) {
    isValid = false;
    validateMessage.email = "Please enter a valid email address";
  }

  //validation for email
  else if (!isEmail) {
    isValid = false;
    validateMessage.email = "Enter a valid email";
  }
  // to check whether user has entered something in password
  if (password.trim().length === 0) {
    isValid = false;
    validateMessage.password = "Please enter your password";
  }

  //validation for password
  else if (!isPassword) {
    isValid = false;
    //validationMessage.password = 'Please enter a password that is between 8 to 12 characters and contains at least one lowercase letter, uppercase letter, number and a symbol.'
    validateMessage.password = "Please enter a valid password";
  }
  return {
    isValid,
    validateMessage,
  };
};
