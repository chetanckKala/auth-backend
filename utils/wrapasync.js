
module.exports.wrapAsync = (fn)=>
{
    return function (req, res, next)
    {
        fn(req, res, next).catch((err)=> res.json({success: false, message: err.message}));
    }
}