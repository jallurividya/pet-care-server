import jwt from "jsonwebtoken"
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({
                status: false,
                error: "Token is missing"
            })
        }
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Invalid or expired token",
        });
    }
}

export const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).send({
                status: false,
                message: "You are not authorized to access this resource"
            })
        }
        next()
    }
}