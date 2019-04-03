module.exports = {

  isLoggedIn(req, res, next){
    if (req.isAuthenticated()) { // Method of password
        return next();
    }else{
        return res.redirect('/signin');
    }
  },
  isLoggedAlready(req, res, next){
    if (!req.isAuthenticated()) { // Method of password
      return next();
    }else{
      return res.redirect('/profile');
    }
  },
};