var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Event = require("../models/event");
var cities = require('indian-cities-json');
var middleware = require("../middleware");
var Task = require("../models/task");
var sgMail = require('@sendgrid/mail');   
var cryptoRandomString = require("crypto-random-string")
//root route
router.get("/", middleware.isLoggedIn,function(req, res){
    var id = req.user._id;
    User.findById(id,(err,user)=>{
        Event.find({},(err,events)=>{
            Task.find({}, (err, tasks) => {
                res.render("homepage",{
                    user:user,
                    event:events,
                    task: tasks
                })
            })
            
        })
    })
});

router.get("/homepage_guest", middleware.isNotLoggedIn,function(req, res){
    // msg : req.flash("success")
    res.render("home");
});

// show register form
router.get("/register",middleware.isNotLoggedIn, function(req, res){
    var cityName = []
    cityName.push(cities)
    var names = []
    for(i=0; i<1221; i++){
        var x = cityName[0].cities[i].name
        names.push(x)
    }
   res.render("signup", {
       data:names
   })
});

//handle sign up logic
router.post("/register",middleware.isNotLoggedIn, function(req, res){
    console.log("hello",Object.keys(req.body)[0])
    var formData = JSON.parse(Object.keys(req.body)[0])
    console.log(formData)
    var newUser = new User({username: formData.username, name: formData.firstname+" "+formData.lastname, city:formData.city, gender:formData.gender});
    User.register(newUser, formData.password, function(err, user){
        console.log(user)
        if(err){
            req.flash("error", err.message);
            console.log(err.message)
            return res.status(422).json({
                msg: err.message
            });
        }
        else{
            return res.status(422).json({
                msg: "Redirect"
            });
        }
    });
});

//show login form
router.get("/login",middleware.isNotLoggedIn, function(req, res){
   res.render("login"); 
});

router.post("/login",middleware.isNotLoggedIn, passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout",middleware.isLoggedIn, function(req, res){
   req.logout();
   req.flash("success", "Logout successful!");
   res.redirect("/homepage_guest");
});

router.get("/changePassword/users/resetPassword/:token",(req,res)=>{
    var token = req.params.token;
    res.render("edit_profile",{token:token})
})

router.post('/requestChangePassword', async function (req, res) {
    const email = req.body.email
    try {
        if (!email) {
            res.send('enter email-id to search');
            return;
        }

        const token = cryptoRandomString({
            length: 20,
            type: 'url-safe',
        });
        console.log("1")
        const date = new Date();
        const expTime = date.getTime() + 60000;

        const updateToken = await User.findOneAndUpdate(
            { username: email },
            { $set: { token, expTime } }
        )
        console.log("2")
            if (!updateToken) throw new Error('Can not find user');
            else {
                console.log(updateToken)
                sgMail.setApiKey("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");
                const sendMail = {
                    to: email,
                    from: "admin@outreach.com",
                    subject: 'reset password',
                    html: `click here to reset password :
                 http://localhost:7005/changePassword/users/resetPassword/${token}
                  Link will expire in 10 min`,
                };
                sgMail.send(sendMail);
                res.send('check your mailid for link');
            }
    } catch (err) {
        res.send(err.message);
    }
})

router.post("/changePassword/users/resetPasswords",(req,res)=>{
    var token = req.body.token;var password = req.body.password;
    console.log("outside",token,password)
    User.findOne({token:token},(err,user)=>{
        console.log(err,user)
        user.setPassword(password,(errr,result)=>{
            console.log("inside",errr,result)
            user.save((error)=>{
                console.log("saveError",error)
            });            
            res.send("password changed")
        })
    })
});

module.exports = router;