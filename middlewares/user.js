const jwt = require("jsonwebtoken")
const key = process.env.SECRET_KEY



module.exports.getId = async (req, res, next) =>
{
    if (!req.cookies || !req.cookies.token)
        return res.json({success: false})

    const data = jwt.verify(req.cookies.token, key)
    req.body.userId = data.id

    return next()
}