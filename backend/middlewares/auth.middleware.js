import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.authorization;

    if (!token) {
        return res.status(401).send("Unauthorized. Authentication required");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send("Invalid or expired token");
        }

        req.user = user;
        next();
    });
}