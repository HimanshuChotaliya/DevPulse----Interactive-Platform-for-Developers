const errorhandling = (err, req, res, next) => {
    console.log(err.stack)
    
    // Explicitly attach CORS headers to the error response to prevent browser masking
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(500).json({
        status : 500,
        message: "Something went wrong",
        error : err.message
    });
};

module.exports = errorhandling