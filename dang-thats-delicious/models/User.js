const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const md5 = require('md5')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    require: 'Please supply an email address',
  },
  name: {
    type: String,
    required: 'Plese supply a name',
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
})

// A virtual field is a field whose info can be generated on the fly, and does
// not need to be stored in the db.
// e.g. if you have a user's weight in pounds, you can generate their weight in
// kgs on the fly in a virtual field, without having to also store their weight
// in kgs in the db.
userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email)
  return `https://gravatar.com/avatar/${hash}?s=200`
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
userSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('User', userSchema)