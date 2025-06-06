//Ensure user is loggeg in - applied in My Note, Create Note and anything else like that

export const ensureAuthenticatedForWeb = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in.');
  res.redirect('/login');
};
