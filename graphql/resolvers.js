const bcrypt = require('bcryptjs');

const validator = require('validator');

const User = require('../models/user')

// as we have only single route /graphql input data validation is done here

module.exports = {
  createUser: async function({userInput}, req) {
    // const email = args.userInput.email;
    const existingUser = await User.findOne({email: userInput.email})
    if(existingUser) {
      const error = new Error('User already exists!');
      throw error;
    }
    const hashedPwd = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPwd
    })
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() }
  }
 }