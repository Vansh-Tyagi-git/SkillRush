const express = require("express");
const app = express();
const path = require("path");

const dummyDb = [
    { username: "Vansh_Garg", password: "123" },
    { username: "Vansh_Tyagi", password: "321" }
];


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.static('public'));

app.listen(5500, ()=>{
    console.log("listening to port localhost:5500");
});

app.get("/", (req, res)=>{
    res.render("main.ejs");
})

app.get("/home", (req, res)=>{
    res.render("main.ejs");
})

app.get("/login", (req, res)=>{
    res.render("login.ejs");
})

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = dummyDb.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, username });
    } else {
        res.json({ success: false, message: "Invalid username or password." });
    }
});

app.get("/dashboard", (req, res) => {
    // For now, just render a simple dashboard page
    res.render("dashboard.ejs");
  });

  

app.get("/courses", (req, res)=>{
    res.render("courses.ejs")
})

app.get("/game", (req, res) => {
    res.render("game.ejs")
})
