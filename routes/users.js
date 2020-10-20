var express = require("express");
var router = express.Router();
var User = require("../models/user");
var middleware = require("../middleware");
var request = require("request");
    
//INDEX - show a logged in user page
router.get("/", function (req, res) {
    // Get all events from DB
    var cityName = []
    cityName.push(cities)
    var names = []
    for(i=0; i<1221; i++){
        var x = cityName[0].cities[i].name
        names.push(x)
    }
    
    User.findById(req.user.id, function (err, details) {
        if (!err) {
            res.render("user_profile", {
                details: details,
                data:names
            });
        }
    });
});


router.put("/:id", function (req, res) {
    var newData = {
        name: req.body.name,
        about: req.body.about,
        gender: req.body.gender,
        phone: req.body.phone,
        city: req.body.city
    };
    User.findByIdAndUpdate(req.user.id, {
        $set: newData
    }, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/user");
        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/user");
        }
    });
});

//Upadate Password
router.put("/changePassword/:id",(req,res)=>{
    User.findOne({_id:req.user.id},(err,user)=>{
        user.setPassword(req.body.newpassword,(errr,result)=>{
            user.save((error)=>{
            });            
            res.redirect("/logout")
        })
    })
});


router.delete('/:id', middleware.checkUserEvent, function (req, res) {
    Event.findByIdAndRemove(req.params.id, function (err, updatedEvent) {
        if (!err) {
            res.redirect("/")
        }
    })
})

module.exports = router;