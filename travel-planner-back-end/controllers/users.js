//core and framework import
const express = require('express')
const router = express.Router()

//middleware imports
const verifyToken = require('../middleware/verify-token')

//model imports
const User = require('../models/user')
const Trip = require('../models/trip')

router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, 'username')
        res.json(users)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})


router.get('/:userId', verifyToken, async (req, res) => {
    try {
        // profile view 
        const user = await User.findById(req.params.userId).select('_id username createdAt')
        if (!user) {
            return res.status(404).json({ err: 'user not found' })
        }

        res.json(user)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})


router.get('/:userId/trips', verifyToken, async (req, res) => {
    try {
       // returns user's trips for profile viewing.
       const trips = await Trip.find({ user: req.params.userId })
       // sorted newest-first by startDate so the UI can render a timeline easily.
            .sort({ startDate: -1 })
            .select('location startDate endDate')
        res.json(trips)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})


module.exports = router