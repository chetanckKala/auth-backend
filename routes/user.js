const express = require("express")
const router = express.Router({mergeParams: true})
const userController = require("../controllers/user.js")
const {wrapAsync} = require("../utils/wrapasync.js")
const {getId} = require("../middlewares/user.js")


router.get(
    "/",
    (req, res) => res.json({message: "API working!"})
)

router.post(
    "/signup",
    wrapAsync(userController.signup)
)

router.post(
    "/send-verify-otp",
    getId,
    wrapAsync(userController.sendVerifyOtp)
)

router.post(
    "/verify-otp",
    getId,
    wrapAsync(userController.verifyOtp)
)

router.post(
    "/send-reset-otp",
    wrapAsync(userController.sendResetOtp)
)

router.post(
    "/reset-password",
    wrapAsync(userController.resetPassword)
)

router.post(
    "/login",
    wrapAsync(userController.login)
)

router.get(
    "/logout",
    wrapAsync(userController.logout)
)


router.get(
    "/data",
    getId,
    wrapAsync(userController.getUserData)
)

router.get(
    "/is-auth",
    getId,
    wrapAsync(userController.authStatus)
)


module.exports = router
