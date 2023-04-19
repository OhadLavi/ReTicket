module.exports = {
    checkAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.render("../public/views/home.ejs", {user: null});
        //res.redirect("/");
    }
}