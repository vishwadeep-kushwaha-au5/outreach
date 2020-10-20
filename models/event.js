  
var mongoose = require("mongoose");

var EventSchema = new mongoose.Schema({
   name: String,
   image: String,
   city: String,
   description: String,
   shortdescription: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      name: String,
      image: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Event", EventSchema);