//core and framework imports
const express = require('express')
const router = express.Router()

//library imports
const jwt = require('jsonwebtoken')

router.get('/sign-token', (req, res) => {
    

    try { console.log(process.env.JWT_SECRET)

        const user = {
        _id: 2,
        username: 'test1',
        password: 'test1',
    }

        const token = jwt.sign({user}, process.env.JWT_SECRET)
        res.json({ token })

    } catch (err) {
        res.status(401).json({ err: err })
    }


})

router.post('/verify-token', (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.json({ decoded })
    } catch (err) {
        res.status(401).json({ err: 'invalid token' })
    }
})

module.exports = router