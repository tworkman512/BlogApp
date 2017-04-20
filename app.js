var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express = require("express");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var app = express();

/////////////////
// APP CONFIG
////////////////
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
// this needs to come after bodyParser
app.use(expressSanitizer());
app.use(methodOverride("_method"));


///////////////////////////
// MONGOOSE/MODEL CONFIG
///////////////////////////
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

////////////////////
// RESTFUL ROUTES
////////////////////

app.get("/", function(req,res){
   res.redirect("/blogs"); 
});

app.get("/blogs", function(req, res){
    // Retrieve all the blogs from the DB
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE    
app.get("/blogs/new", function(req, res){
   res.render("new"); 
});

// CREATE ROUTE    
app.post("/blogs", function(req, res){
   // create blog
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog, function(err, newBlog){
      if(err){
          res.render("new");
      } else {
          // then, redirect to the index
          res.redirect("/blogs");
      }
   });
});

// SHOW ROUTE   
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
      if(err){
          res.redirect("/blogs"); 
      } else {
          res.redirect("/blogs/" + req.params.id);
      }
   });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    //destroy blog post
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("BLOG APP IS UP AND RUNNING!");
});