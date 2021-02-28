const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/user')
const Post = require('../models/post')

// as we have only single route /graphql input data validation is done here

module.exports = {
  createUser: async function({userInput}, req) {
    const errors = []
    if(!validator.isEmail(userInput.email)){
      errors.push({message: 'Email Id is invalid'})
    }
    if(validator.isEmpty(userInput.password) || 
      !validator.isLength(userInput.password, {min: 5})) {
        errors.push({message: 'Password too short'});
    }
    if(errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }
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
  },

  login: async function({email, password}) {
    const user = await User.findOne({email: email});
    if(!user) {
      const error = new error('Invalid email');
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if(!isEqual) {
      const error = new error('Invalid Password');
      error.code = 401;
      throw error;
    }
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email
    }, 'secretsecret', {expiresIn: '1h'})

    return {token: token, userId: user._id.toString()}
  }, 

  createPost: async function({postInput}, req) {
    if(!req.isAuth) {
      const error = new Error('Not Authenticated!');
      error.code = 401;
      throw error;
    }
    const errors = []
    if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 3} )){
      errors.push({message: 'Title should atleast 3 letters'})
    }
    if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 4} )){
      errors.push({message: 'Content should atleast 4 letters'})
    }
    if(errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId)
    if(!user) {
      const error = new Error('Invalid user');
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      imageUrl: postInput.imageUrl,
      content: postInput.content, 
      creator: user
    })
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save()
    return { 
      ...createdPost._doc, 
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  }
 };