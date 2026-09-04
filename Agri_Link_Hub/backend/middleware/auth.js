const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        console.error("Authentication required");
        res.status(500).json({ message: "Authentication required!" });
    }
    try {
        const decodedInfo = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedInfo;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ message: "Invalid or Expired token" })
    }
}

module.exports = auth;
