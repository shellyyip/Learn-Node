const passport = require('passport')

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login',
  successRedirect: '/',
  successFlash: 'You are now logged in',
})

exports.logout = (req, res) => {
  req.logout()
  req.flash('success', 'You are now logged out.')
  res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  // First check if user is authenticated with Passport
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error', 'Oops! You must be logged in to proceed.')
  res.redirect('/')
}