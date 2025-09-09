const express = require("express");
const app = express();
const path = require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extemded:true}));
app.use(express.static(path.join(__dirname,"public")));

app.listen(5500, ()=>{
    console.log("listening to port 5500");
});

app.get("/", (req, res)=>{
    res.send("hello");
})

app.get("/home", (req, res)=>{
    res.render("main.ejs")
})

app.get("/courses", ()=>{
    res.render("courses.ejs")
})