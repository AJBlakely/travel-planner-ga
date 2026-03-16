//core and framework imports
const express = require('express')
const router = express.Router()

//middeware imports
const verifyToken = require('../middleware/verify-token')

//model imports
const Trip = require('../models/trip')


function isOwner(trip, userId) {
  return trip.user && trip.user.toString() === userId
}

router.get('/', verifyToken, async (req, res) => {
  try {
    //lists the authenticated user's trips ("all the places I've been in one place")
    const trips = await Trip.find({ user: req.user._id })
      .sort({ startDate: -1 })
      .select('location startDate endDate accommodations tips user comments createdAt updatedAt')
    res.json({ trips })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

router.get('/feed', verifyToken, async (req, res) => {
  try {
    // Shared feed of all trips so users can discover destinations from other users.
    const trips = await Trip.find({})
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .select('location startDate endDate accommodations tips user comments createdAt updatedAt')

    res.json({ trips })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

router.get('/:tripId', verifyToken, async (req, res) => {
  try {
    //trip detail view 
    const trip = await Trip.findById(req.params.tripId)
      .populate('user', 'username')
      .populate('comments.author', 'username')

    if (!trip) return res.status(404).json({ err: 'trip not found' })

    res.json({ trip })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  try {
   const { location, accommodations, startDate, endDate, tips } = req.body || {}
   
   if (!location || !startDate || !endDate) {
       return res.status(400).json({ err: 'location, startDate, and endDate are required' })
    }
    
    // creates a destination/trip for the logged-in user
    const trip = await Trip.create({
      location,
      accommodations,
      startDate,
      endDate,
      tips,
      user: req.user._id,
    })

    res.status(201).json({ trip })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})


//update of a trip.
router.put('/:tripId', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) return res.status(404).json({ err: 'trip not found' })
        
    //Only the owner can update their trip.
    if (!isOwner(trip, req.user._id)) return res.status(403).json({ err: 'unauthorized access' })

    const { location, accommodations, startDate, endDate, tips } = req.body || {}
    if (location !== undefined) trip.location = location
    if (accommodations !== undefined) trip.accommodations = accommodations
    if (startDate !== undefined) trip.startDate = startDate
    if (endDate !== undefined) trip.endDate = endDate
    if (tips !== undefined) trip.tips = tips

    await trip.save()
    res.json({ trip })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})


// delete
router.delete('/:tripId', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
    if (!trip) return res.status(404).json({ err: 'trip not found' })

    // Only the owner can delete their trip.
    if (!isOwner(trip, req.user._id)) return res.status(403).json({ err: 'unauthorized access' })

    await trip.deleteOne()
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})


module.exports = router
