
const jwt = require('jsonwebtoken')

function verifyToken (req, res, next) {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null

        if (!token) {
            return res.status(401).json({ err: 'missing token' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const payload = decoded.payload || decoded.user

        if (!payload || !payload._id) {
            return res.status(401).json({ err: 'invalid token payload' })
        }

        req.user = payload

        next()
    } catch (err) {
        res.status(401).json({ err: 'invalid token' })
    }
}

module.exports = verifyToken
