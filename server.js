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
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-find-or-create');



const app = express();

// app.use(express.static(path.join(__dirname, 'client', 'build')));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(session({
    secret: process.env.GO_ON,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        maxAge: 3000 * 60 * 60,
    },

    store: MongoStore.create({
        mongoUrl: process.env.URL_DB,
    }),

}));

app.use(passport.initialize());
app.use(passport.session());



app.use(cors({
    origin: true,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,

}));


mongoose.connect(process.env.URL_DB, {

    useNewUrlParser: true,
    useUnifiedTopology: true
});



mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    name: String,
    lastName: String,
    username: String,
    password: String,
    facebookId: String,
});



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);



const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


// -------------------Add Facebook Login--------------------------------

passport.use(new FacebookStrategy({
    clientID: "234403834687847",
    clientSecret: "60ebdbff923f8d599a03513b3230293a",
    callbackURL: "http://localhost:5000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'emails']
    
},
    (accessToken, refreshToken, profile, done) => {
      
        User.findOrCreate({ facebookId: profile.id }, (err, user) => {
            
            if (err) {
                return done(err);
            }
            done(null, user);
        });
    }

));

app.get("/auth/facebook", passport.authenticate('facebook',{ scope : ['email'] }));

app.get("/auth/facebook/callback", function (req, res) {


    passport.authenticate("facebook")(req, res, () => {

        console.log(req.isAuthenticated());
        console.log(req.user);
        res.redirect("http://localhost:3000/");

    });

});





/*---------------------------------------------------------------------*/

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

// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started...");
});