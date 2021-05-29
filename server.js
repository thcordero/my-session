require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoStore = require("connect-mongo");
const path = require("path");


const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(session({
    secret: "sUperSecreTo123456*/#/*-*$&@#$!@*$#(&%@)!",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
    },
    
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://thcordero:123@cluster0.s9n4e.mongodb.net/myUsers",
    }),

}));

app.use(passport.initialize());
app.use(passport.session());



app.use(cors({
    origin: true,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,

}));


mongoose.connect("mongodb+srv://thcordero:123@cluster0.s9n4e.mongodb.net/myUsers", {

    useNewUrlParser: true,
    useUnifiedTopology: true
});



mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    name: String,
    lastName: String,
    username: String,
    password: String,
});



userSchema.plugin(passportLocalMongoose);



const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.post("/api/register", (req, res) => {

    const newUser = new User({
        name: req.body.name,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
    });
    User.register({
        name: newUser.name,
        lastName: newUser.lastName,
        username: newUser.username,
    }, newUser.password, function (err, user) {
        if (err) {
            res.send(err);

        } else {
            passport.authenticate("local")(req, res, () => {
                console.log("User registed!");
                res.send({ user: req.user, isAuth: req.isAuthenticated(), sessionID: req.sessionID });

            });
        }
    });


});

app.post('/api/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {

        if (err) {
            return next(err);
        }
        if (!user) {
            return res.send(info);
        }
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            return res.send({ user: req.user, isAuth: req.isAuthenticated(), sessionID: req.sessionID });
        });
    })(req, res, next);

});



app.get("/api/logout", (req, res) => {

    req.logout();

    res.send({ user: req.user, isAuth: req.isAuthenticated(), sessionID: req.sessionID });

});



app.get("/api/secrets", (req, res) => {
    if (req.isAuthenticated) {

        res.send({ user: req.user, isAuth: req.isAuthenticated(), sessionID: req.sessionID });

    } else {
        res.send("Is not log");
    }

});



const itemSchema = new mongoose.Schema({
    item: String,
    isChecked: Boolean,
});


app.post("/api/list/:userId", (req, res) => {

    const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    const newItem = new Item({
        item: req.body.item,
        isChecked: false,

    });
    console.log(newItem);

    console.log(req.params.userId);

    newItem.save(function (err) {
        if (!err) {
            res.send(newItem);
        } else {
            res.send(err);
        }
    });

});

app.patch("/api/list/:userId", (req, res) => {

    const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    Item.findOneAndUpdate(
        { _id: req.body.checkedItemId },
        { isChecked: req.body.checkedValue },
        function (err) {
            if (!err) {
                res.send("Successfully updated List.");
            } else {
                res.send(err);
            }
        }
    );
});


app.get("/api/list/:userId", (req, res) => {

    const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    Item.find(function (err, foundList) {
        if (!err) {
            res.send(foundList);
        } else {
            res.send(err);
        }
    });

});

app.delete("/api/list/:userId", (req, res) => {

    const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    Item.deleteOne({ _id: req.body.itemId }, err => {
        if (err) {
            console.log(err);
        }
        else {
            res.send("Item deleted from List!");
        }

    });

});

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started on port 5000");
});