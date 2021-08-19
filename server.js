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
const nodemailer = require("nodemailer");
const axios = require("axios");

/* ---------------- Mailer ---------------- */

const sendConfimationEmail = (toUser, hash) => {
    return new Promise((res, rej) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            }

        });

        const message = {
            from: process.env.GMAIL_USER,
            to: toUser, //toUser
            subject: "Active Account",
            html:
                "<a href=http://localhost:3000/setpassword/" + hash + "> Active Account </a>",

        }

        transporter.sendMail(message, (err, info) => {
            if (err) {
                rej(err);
            }
            else {
                res(info);
            }
        });
    });
}

/* ---------------------------------------- */


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

const userTempSchema = new mongoose.Schema({
    username: String,
    // timeToLive: { type: Date, index: { expires: 604800 }, default: Date.now } //7 days?
});

const UserTemp = new mongoose.model("UserTemp", userTempSchema);

const userSchema = new mongoose.Schema({
    name: String,
    lastName: String,
    username: String,
    password: String,
    facebookId: String,

    itemSchema = new mongoose.Schema({
            item: String,
            isChecked: Boolean,
        }),

    // checkList: [
    //     {
    //         listId: String,
    //         listname: String,
    //         list: [
    //             {
    //                 item: String,
    //                 isCheked: Boolean,
    //             }
    //         ]
    //     }
    // ],
    userTempId: String,
});

// const itemSchema = new mongoose.Schema({
//     item: String,
//     isChecked: Boolean,
// });

const Item = new mongoose.model("Item", itemSchema);



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
    callbackURL: "https://your-check-list.herokuapp.com/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'emails']

},
    (accessToken, refreshToken, profile, done) => {

        console.log(profile);

        User.findOrCreate({ facebookId: profile.id }, { username: profile.emails[0].value }, (err, user) => {

            if (err) {
                return done(err);
            }
            done(null, user);
        });
    }
));

app.get("/auth/facebook", passport.authenticate('facebook', { scope: ['email'] }));

app.get("/auth/facebook/callback", function (req, res) {


    passport.authenticate("facebook")(req, res, () => {

        console.log(req.isAuthenticated());
        console.log(req.user);
        res.redirect("https://your-check-list.herokuapp.com/");

    });

});


/*---------------------------------------------------------------------*/

app.post("/api/register/tempuser", (req, res) => {

    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else if (user) {
            console.log(user);
            res.send({ message: "User already registed!" });
        }
        else if (!user) {
            axios.get("http://apilayer.net/api/check?access_key=" + process.env.KEY_EMAIL_VALIDATION + "&email=" + req.body.username + "&smtp=1&format=1")
                .then(result => {
                    console.log(result.data.smtp_check);
                    if (result.data.smtp_check) {

                        UserTemp.findOne({ username: req.body.username }, (err, user) => {
                            if (err) {
                                console.log(err);
                            }
                            else if (user) {
                                console.log("User already registed!");
                                res.send("User already registed!");
                            }
                            else if (!user) {

                                const newTempUser = new UserTemp({
                                    username: req.body.username,
                                    tempUserFlag: true,
                                });

                                newTempUser.save((err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        sendConfimationEmail(newTempUser.username, newTempUser._id);
                                        res.send(
                                            {
                                                smtp_check: result.data.smtp_check,
                                                user: {
                                                    username: newTempUser.username,
                                                    _id: newTempUser._id,
                                                    tempUserFlag: newTempUser.tempUserFlag,
                                                }

                                            });
                                    }
                                });

                            }

                        });
                    }
                    else {
                        res.send({ smtp_check: result.data.smtp_check, message: "Invalid Email" });
                    }
                })
                .catch(err => { console.log(err) });
        }
    });






});


app.get("/api/register/tempuser/:userId", (req, res) => {

    console.log(req.params.userId);

    UserTemp.findOne({ _id: req.params.userId }, (err, user) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else if (user) {
            console.log(user);
            res.send(user);
        }
        else if (!user) {
            console.log("This link is not working any more!");
            res.send(user);
        }
    });
});

app.delete("/api/register/tempuser/:userId", (req, res) => {

    console.log(req.params.userId);

    UserTemp.deleteOne({ _id: req.params.userId }, err => {
        if (err) {
            console.log(err);
        }
        else {
            res.send("Temp user deleted!");
        }

    });

});


app.post("/api/register", (req, res) => {

    User.register({ username: req.body.username }, req.body.password, (err, user) => {

        if (err) {
            console.log(err);
            res.send(err);

        } else {
            console.log("Anda?");

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


app.post("/api/secrets/:userId", (req, res) => {

    User.findOne({ _id: req.params.userId }, (err, user) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else if (user) {
            console.log(user);
            res.send({ message: "User already registed!" });
        }
        else if (!user){
            res.send("Something went wrong!")
        }
    });

    // const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    // const newItem = new Item({
    //     item: req.body.item,
    //     isChecked: false,

    // });
    // console.log(newItem);

    // console.log(req.params.userId);

    // newItem.save((err) => {
    //     if (!err) {
    //         res.send(newItem);
    //     } else {
    //         res.send(err);
    //     }
    // });

});

app.patch("/api/secrets/:userId", (req, res) => {

    const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    Item.findOneAndUpdate(
        { _id: req.body.checkedItemId },
        { isChecked: req.body.checkedValue },
        (err) => {
            if (!err) {
                res.send("Successfully updated List.");
            } else {
                res.send(err);
            }
        }
    );
});


app.get("/api/secrets/:userId", (req, res) => {

    const Item = new mongoose.model(req.params.userId + "Item", itemSchema);

    Item.find((err, foundList) => {
        if (!err) {
            res.send(foundList);
        } else {
            res.send(err);
        }
    });

});

app.delete("/api/secrets/:userId", (req, res) => {

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