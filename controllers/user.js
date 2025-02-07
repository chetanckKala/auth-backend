const User = require("../models/user.js")
const bcrypt = require("bcrypt")
const saltRounds = Number(process.env.SALT_ROUNDS)
const salt = bcrypt.genSaltSync(saltRounds)
const jwt = require("jsonwebtoken")
const key = process.env.SECRET_KEY
const transporter = require("../config/mail.js")




module.exports.signup = async (req, res, )=>
{
    const {username, email, password} = req.body

    // check details present or not
    if (!username || !email || !password)
        return res.json({success: false, message: "please provide user details"})

    // user exist or not
    let temp = await User.findOne({email: email})
    if (temp)
        return res.json({success: false, message: "user already exist, use different email"})

    // create new user
    const hash = bcrypt.hashSync(password, salt)
    const newUser = new User ({...req.body, password: hash})
    
    const result = await newUser.save()

    // send token to client
    const token = jwt.sign({id: result._id}, key, {expiresIn: "7d"})
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    // send email
    const mailOptions = {
        from: `"MANIT Web" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Welcome to MANIT!",
        text: `Hi ${username},

        Welcome to MANIT Web! We're thrilled to have you on board.

        Here’s what you can do next:
        1️⃣ Explore your dashboard – Check out all the features tailored for you.
        2️⃣ Complete your profile – Add a personal touch by updating your details.
        3️⃣ Get started – Dive right in and enjoy everything [Your App Name] has to offer.

        If you have any questions or need assistance, we’re here to help! Reach out to us at [support email] or visit our [help center link].

        Thank you for joining the MANIT Web community. Let’s make great things happen together!

        Cheers,
        MANIT Web Team`
    }

    await transporter.sendMail(mailOptions)

    return res.json({success: true, message: "signup successful!"})
}


module.exports.sendVerifyOtp = async (req, res) => 
{
    const {userId} = req.body

    // check userid
    if (!userId)
        return res.json({success: false, message: "please provide user id"})
    
    const user = await User.findById(userId)

    // check valid user
    if (!user)
        return res.json({success: false, message: "user not found"})

    // check verified
    if (user.isVerified)
        return res.json({success: false, message: "user already verified"})

    // generate otp
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.otpVerify = otp
    user.otpVerifyExpires = Date.now() + 5*60*1000
    await user.save()

    // sent otp to mail
    const mailOptions = {
        from: ` "MANIT Web" <${process.env.SENDER_EMAIL}>` ,
        to: user.email,
        subject: "Account Verification Otp",
        text: `Hi ${user.username},

        Your One-Time Password (OTP) for verifying your account is:

        ${otp}

        This code is valid for 5 minutes

        Best regards,
        The MANIT Web Team`
    }

    await transporter.sendMail(mailOptions)
    
    return res.json({success: true, message: "OTP sent successfully!"})
}


module.exports.verifyOtp = async (req, res)=>
{
    const {userId, otp} = req.body
    const user = await User.findById(userId)

    // check valid user
    if (!user)
        return res.json({success: false, message: "user not found"})

    // check is verified
    if (user.isVerified)
        return res.json({success: false, message: "user already verified"})

    // check otp
    if (otp === "" || user.otpVerify !== otp)
        return res.json({success: false, message: "Invalid OTP"})

    if (user.otpVerifyExpires < Date.now())
        return res.json({success: false, message: "OTP expired"})

    user.otpVerify = ""
    user.otpVerifyExpires = 0
    user.isVerified = true
    await user.save()

    return res.json({success: true, message: "OTP verified successfully!"})
}

module.exports.sendResetOtp = async (req, res) =>
{
    const {email} = req.body

    if (!email)
        return res.json({success: false, message: "please provide email"})

    // check if user exists
    const user = await User.findOne({email: email})
    if (!user)
        return res.json({success: false, message: "invalid email!"})

    // generate otp
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.otpReset = otp
    user.otpResetExpires = Date.now() + 5*60*1000
    await user.save()

    // send mail
    const mailOptions = {
        from: ` "MANIT Web" <${process.env.SENDER_EMAIL}> `,
        to: email,
        subject: "Reset Password",
        text: `Hi ${user.username},

        Your One-Time Password (OTP) for password reset is:

        ${otp}

        This code is valid for 5 minutes

        Best regards,
        The MANIT Web Team`
    }

    await transporter.sendMail(mailOptions)

    return res.json({success: true, message: "OTP sent successfully!"})
}


module.exports.resetPassword = async (req, res) =>
{
    const {email, otp, newPassword} = req.body
    if (!email || !otp || !newPassword)
        return res.json({success: false, message: "please provide all details"})

    // check valid user
    const user = await User.findOne({email: email})
    if (!user)
        return res.json({success: false, message: "user not found!"})

    // verify otp
    if (otp === "" || otp !== user.otpReset)
        return res.json({success: false, message: "invalid otp!"})

    if (Date.now() > user.otpResetExpires)
        return res.json({success: false, message: "otp expired!"})

    // reset password
    const hash = bcrypt.hashSync(newPassword, salt)
    user.password = hash
    user.otpReset = ""
    user.otpResetExpires = 0
    await user.save()

    return res.json({success: true, message: "password reset successfully"})
}



module.exports.login = async (req, res) => 
{
    const {email, password} = req.body

    // check details present or not
    if (!email || !password)
        return res.json({success: false, message: "please provide user details"})

    // check user exist or not
    const user = await User.findOne({email: email})
    if (!user)
        return res.json({success: false, message: "user does not exist"})

    // check password
    const flag = bcrypt.compareSync(password, user.password)
    if (!flag)
        return res.json({success: false, message: "wrong password"})

    // send token to client
    const token = jwt.sign({id: user._id}, key, {expiresIn: "7d"})
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.json({success: true, message: "login successful!"})
}


module.exports.logout = async (req, res)=>
{
    if (!req.cookies.token)
        return res.json({success: false, message: "already logged out!"})

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.ENV === "production",
    })

    return res.json({success: true, message: "logout successful!"})
}


module.exports.getUserData = async (req, res) =>
{
    const {userId} = req.body

    // check userid
    if (!userId)
        return res.json({success: false, message: "please provide user id"})
    
    const user = await User.findById(userId)

    // check valid user
    if (!user)
        return res.json({success: false, message: "user not found"})

    // send data
    return res.json({success: true, user})

}


module.exports.authStatus = async (req, res) =>
{
    const {userId} = req.body

    if (!userId)
        return res.json({success: false, message: "Unauthorised user"})

    // check valid user
    const user = await User.findById(userId)
    if (!user)
        return res.json({success: false, message: "user not found"})

    return res.json({success: true, message: "user authenticated"})
}