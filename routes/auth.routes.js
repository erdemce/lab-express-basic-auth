const router = require("express").Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')

/* GET signin page */
router.get("/signin", (req, res, next) => {
    res.render('auth/signin.hbs')
});

/* GET signup page */
router.get("/signup", (req, res, next) => {
    res.render('auth/signup.hbs')
});

// Handle POST requests to /signin
router.post("/signin", (req, res, next) => {
    const {
        userName,
        password
    } = req.body
    if (!userName.length || !password.length) {
        res.render("auth/signin", {
            msg: "Please enter all fields"
        })
        return;
    }
    UserModel.findOne({
            userName
        })
        .then((oneUser) => {
            if (oneUser) {
                bcrypt.compare(password, oneUser.password)
                    .then((isOk) => {
                        if (isOk) {
                            req.session.loggedInUser = oneUser

                            res.redirect("/main")
                        } else {
                            res.render("auth/signin.hbs", {
                                msg: "Passwords don't match"
                            })
                        }
                    })
            } else {
                res.render("auth/signin.hbs", {
                    msg: "User Name does not exists"
                })
            }
        })
        .catch((err) => {
            console.log(err);
        })
})

router.post("/signup", (req, res, next) => {
    const {
        userName,
        password
    } = req.body

    if (!userName.length || !password.length) {
        res.render("auth/signup", {
            msg: "Please enter all fields"
        })
        return;
    }
    // at least one number, one lowercase and one uppercase letter
    // at least eight characters

    let isPas = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    if (!isPas.test(password)) {
        res.render("auth/signup", {
            msg: "Password should be at least eight characters and include at least one number, one lowercase and one uppercase letter"
        })
        return;
    }

    UserModel.findOne({
            userName
        })
        .then((oneUser) => {
            if (oneUser) {
                res.render("auth/signup", {
                    msg: "User Name already in use, please try another user name"
                })
                return;
            }
        })
        .catch((err) => {
            console.log(err);
            return;
        })

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    UserModel.create({
            userName,
            password: hash
        })
        .then(() => {
            res.redirect('/')
        })
        .catch((err) => {
            next(err)
        })
});

const isAnyLoggedUser = (req, res, next) => {
    if (req.session.loggedInUser) {
        next()
    } else {
        res.redirect("/signin")
    }
}

router.get("/main", isAnyLoggedUser, (req, res) => {
    let userName = req.session.loggedInUser.userName
    res.render("main.hbs", {
        userName
    })
})

router.get("/private", isAnyLoggedUser, (req, res) => {
    let userName = req.session.loggedInUser.userName
    res.render("private.hbs", {
        userName
    })
})

router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/");
})


module.exports = router;