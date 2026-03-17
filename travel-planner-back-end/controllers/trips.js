//core and framework imports
const express = require('express')
const router = express.Router()
const multer = require('multer')

//middeware imports
const verifyToken = require('../middleware/verify-token')
const { uploadTripPhoto, deleteTripPhoto, getTripPhotoFile } = require('../services/gcsStorage')

//model imports
const Trip = require('../models/trip')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new Error('Only image uploads are allowed.'))
  }
})


function isOwner(trip, userId) {
  return trip.user && trip.user.toString() === userId
}

function buildPhotoUrl(req, trip) {
  if (!trip.photoStoragePath) return null
  return `${req.protocol}://${req.get('host')}/trips/${trip.id || trip._id}/photo`
}

async function serializeTrip(trip, req) {
  const serializedTrip = typeof trip.toJSON === 'function' ? trip.toJSON() : { ...trip }
  serializedTrip.photoUrl = buildPhotoUrl(req, serializedTrip)
  return serializedTrip
}

router.get('/', verifyToken, async (req, res) => {
  try {
    //lists the authenticated user's trips ("all the places I've been in one place")
    const trips = await Trip.find({ user: req.user._id })
      .sort({ startDate: -1 })
      .select('location startDate endDate accommodations tips photoUrl photoStoragePath user comments createdAt updatedAt')

    const serializedTrips = await Promise.all(trips.map((trip) => serializeTrip(trip, req)))
    res.json({ trips: serializedTrips })
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
      .select('location startDate endDate accommodations tips photoUrl photoStoragePath user comments createdAt updatedAt')

    const serializedTrips = await Promise.all(trips.map((trip) => serializeTrip(trip, req)))
    res.json({ trips: serializedTrips })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

router.get('/:tripId/photo', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).select('photoStoragePath')
    if (!trip || !trip.photoStoragePath) {
      return res.status(404).end()
    }

    const file = await getTripPhotoFile(trip.photoStoragePath)
    if (!file) {
      return res.status(404).end()
    }

    const [metadata] = await file.getMetadata()
    if (metadata.contentType) {
      res.setHeader('Content-Type', metadata.contentType)
    }

    if (metadata.cacheControl) {
      res.setHeader('Cache-Control', metadata.cacheControl)
    }

    file.createReadStream()
      .on('error', () => res.status(404).end())
      .pipe(res)
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

    const serializedTrip = await serializeTrip(trip, req)
    res.json({ trip: serializedTrip })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

router.post('/', verifyToken, upload.single('photo'), async (req, res) => {
  try {
   const { location, accommodations, startDate, endDate, tips } = req.body || {}
   
   if (!location || !startDate || !endDate) {
       return res.status(400).json({ err: 'location, startDate, and endDate are required' })
    }
    
    // creates a destination/trip for the logged-in user
    let photoData = null
    if (req.file) {
      photoData = await uploadTripPhoto(req.file, req.user._id)
    }

    const trip = await Trip.create({
      location,
      accommodations,
      startDate,
      endDate,
      tips,
      photoUrl: photoData?.photoUrl,
      photoStoragePath: photoData?.photoStoragePath,
      user: req.user._id,
    })

    const serializedTrip = await serializeTrip(trip, req)
    res.status(201).json({ trip: serializedTrip })
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})


//update of a trip.
router.put('/:tripId', verifyToken, upload.single('photo'), async (req, res) => {
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

    if (req.file) {
      const nextPhoto = await uploadTripPhoto(req.file, req.user._id)
      const previousPhotoStoragePath = trip.photoStoragePath

      trip.photoUrl = nextPhoto.photoUrl
      trip.photoStoragePath = nextPhoto.photoStoragePath

      await deleteTripPhoto(previousPhotoStoragePath)
    }

    await trip.save()
    const serializedTrip = await serializeTrip(trip, req)
    res.json({ trip: serializedTrip })
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

    await deleteTripPhoto(trip.photoStoragePath)
    await trip.deleteOne()
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ err: err.message })
  }

  if (err && err.message) {
    return res.status(400).json({ err: err.message })
  }

  next(err)
})


module.exports = router
