var express = require("express");
var router = express.Router();
var Event = require("../models/event");
var middleware = require("../middleware");
var request = require("request");
    
//INDEX - show all events
router.get("/", function (req, res) {
    // Get all events from DB
    Event.find({}, function (err, allEvents) {
        if (!err) {
            res.render("events/index", {
                events: allEvents
            });
        }
    });
});

//CREATE - add new event to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    var ff = new multiparty.Form();
    ff.parse(req, (err, fields, file) => {

        console.log(fields, file.imageFile[0].originalFilename)
        cloudinary.uploader.upload(file.imageFile[0].path, (err, result) => {
            console.log("nono", fields.city[0], fields.city)
            var eventname = fields.eventname[0];
            var city = fields.city[0];
            var imageFile = result.secure_url;
            var desc = fields.description[0];
            var shortdesc = fields.description[0].substring(0, 100);
            var author = {
                id: req.user._id,
                name: req.user.name,
                image: req.user.imageFile
            }
            var newEvent = {
                name: eventname,
                image: imageFile,
                city: city,
                description: desc,
                shortdescription: shortdesc,
                author: author
            }
            // Create a new event and save to DB
            Event.create(newEvent, function (err, newlyCreated) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/");
                }
            });
        });
    });



});

//NEW - show form to create new event
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("events/new");
});

// SHOW - shows more info about one event
router.get("/:id", middleware.isLoggedIn, function (req, res) {
    //find the event with provided ID
    var isAdmin = false
    console.log(req.params.id)
    Event.findById(req.params.id).populate("comments").exec(function (err, foundEvent) {
        if (err) {
            console.log(err);
        } else {
            if (JSON.stringify(foundEvent.author.id) === JSON.stringify(req.user._id))
                isAdmin = true;
                var i = foundEvent.comments
            res.render("events/show", {
                event: foundEvent,
                state: isAdmin,
                i: i
            });
        }
    });
});


router.put("/:id", middleware.checkUserEvent, function (req, res) {
    var newData = {
        name: req.body.eventname,
        image: req.body.imageFile,
        description: req.body.description,
        city: req.body.city
    };
    Event.findByIdAndUpdate(req.params.id, {
        $set: newData
    }, function (err, event) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/event/" + event._id);
        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/event/" + event._id);
        }
    });
});

router.delete('/:id', middleware.checkUserEvent, function (req, res) {
    Event.findByIdAndRemove(req.params.id, function (err, updatedEvent) {
        if (!err) {
            res.redirect("/")
        }
    })
})

module.exports = router;