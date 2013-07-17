var check = require('validator').check
  , sanitize = require('validator').sanitize
  , User = require('./models').User;

exports.userValidator = function (user, callback) {
  console.log("validateUser");

  var errors = new Array();

  // Username
  try {
    check(user.username, 'Username empty').notEmpty();
    user.username = sanitize(user.username).trim();
  } catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['username'] = e.message;
  }

  //Email
  try {
    check(user.email, 'Email empty').notEmpty();
    user.email = sanitize(user.email).trim();
    check(user.email, 'Email not valid').isEmail();

  } catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['email'] = e.message;
  }

  // Password
  try {
    check(user.password, 'Password empty').notEmpty();
    check(user.password, 'Password must be more than 4 characters').len(4,9999);

  } catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['password'] = e.message
  }

  User.findOne()
    .$or([{'username': user.username},{'email': user.email}])
    .run(function (err, doc) {
      console.log("doc: ", doc);
      if (doc && doc.username == user.username) {
        errors['username'] = "Username already exists";
      }
      else if (doc && doc.email == user.email) {
        errors['email'] = "Email already exists";
      }

      // console.log("errors: ", errors);
      // console.log("callback: ", callback);
      callback(errors);
    });
}

exports.loginValidator = function (user, callback) {
  //console.log("loginUser");

  var errors = new Array();

  // Username
  try {
    check(user.username, 'Please enter an username').notEmpty();
    user.username = sanitize(user.username).trim();
  }
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['username'] = e.message;
  }

  // Password
  try {
    check(user.password, 'Please enter a password').notEmpty();
  }
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['password'] = e.message
  }

  callback(errors);
}


// customer validation
exports.customerValidator = function (customer, callback) {
  console.log("validate customer");

  var errors = new Array();

  // customer first name
  try {
    check(customer.firstName, 'Please enter the customers first name').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['firstName'] = e.message;
  }

  // customer last name
  try {
    check(customer.lastName, 'Please enter the customers last name').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['lastName'] = e.message;
  }

  // customer address
  try {
    check(customer.address1, 'Please enter the customers address').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['address1'] = e.message;
  }


  // customer phone
  try {
    check(customer.tel1a, 'Please enter a valid phone number').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['phone'] = e.message;
  }

  try {
    check(customer.tel1b, 'Please enter a valid phone number').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['phone'] = e.message;
  }

    try {
    check(customer.tel1c, 'Please enter a valid phone number').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['phone'] = e.message;
  }


  // customer email
  try {
    check(customer.email, 'Please enter the customers address').notEmpty();
    customer.email = sanitize(customer.email).trim();
    check(customer.email, 'Email not valid').isEmail();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['email'] = e.message;
  }

  callback(errors);
}

// Job validator
exports.jobValidator = function (job, callback) {
  console.log("validate Job");

  var errors = new Array();

  // Job name
  try {
    check(job.name, 'Please enter a name for this job').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['name'] = e.message;
  }

  // job description
  try {
    check(job.description, 'Please enter a brief desciption of the job').notEmpty();
  } 
  catch (e) {
      console.log(e.message); //Please enter a valid integer
      errors['description'] = e.message
  }

  callback(errors);
}