//Core & framework imports
const express = require('express')
const router = express.Router()

//library imports
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { google } = require('googleapis')

//model imports
const User = require('../models/user')

const saltRounds = 12
const FRONT_END_URL = process.env.FRONT_END_URL || 'http://localhost:5173'

const getOAuthClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || process.env.REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) return null
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

const createToken = (user) => {
    const payload = { username: user.username, _id: user._id }
    return jwt.sign({ payload }, process.env.JWT_SECRET)
}

const normalizeUsername = (raw) => {
    const cleaned = String(raw || 'traveler')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24)

    return cleaned || 'traveler'
}

const generateUniqueUsername = async (candidate) => {
    const base = normalizeUsername(candidate)
    let username = base
    let suffix = 1

    while (await User.findOne({ username })) {
        username = `${base}${suffix}`.slice(0, 28)
        suffix += 1
    }

    return username
}

router.post('/sign-up', async (req, res) => {
    console.log('Sign-up request received:', req.body)
    try {
        const userInDatabase = await User.findOne({ username: req.body.username })
        if(userInDatabase) {
            return res.status(409).json({ err: 'Username already taken' })
        }
        const user = await User.create({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, saltRounds)
        })

        const token = createToken(user)

        res.status(201).json({ token })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})

router.post('/sign-in', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        if(!user || !user.password) {
            return res.status(401).json({ err: 'invalid credentials' })
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password)
        if(!isPasswordCorrect) {
            return res.status(401).json({ err: 'invalid credentials' })
        }
        const token = createToken(user)
        res.status(200).json({ token })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})

router.get('/google', (req, res) => {
    const oauth2Client = getOAuthClient()
    if (!oauth2Client) {
        return res.status(500).json({ err: 'Google OAuth is not configured on the server.' })
    }

    const scopes = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    })

    res.redirect(url)
})

router.get('/google/callback', async (req, res) => {
    try {
        const oauth2Client = getOAuthClient()
        if (!oauth2Client) {
            return res.status(500).json({ err: 'Google OAuth is not configured on the server.' })
        }

        const { code } = req.query
        if (!code) {
            return res.status(400).json({ err: 'Missing authorization code.' })
        }

        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        })

        const { data: userInfo } = await oauth2.userinfo.get()

        if (!userInfo?.id || !userInfo?.email) {
            return res.status(400).json({ err: 'Google account did not provide required profile data.' })
        }

        let user = await User.findOne({ googleId: userInfo.id })
        if (!user) {
            user = await User.findOne({ email: userInfo.email })
        }

        if (!user) {
            const candidate = userInfo.email.split('@')[0] || userInfo.name || 'traveler'
            const username = await generateUniqueUsername(candidate)

            user = await User.create({
                username,
                email: userInfo.email,
                googleId: userInfo.id,
                authProvider: 'google'
            })
        } else {
            if (!user.email) user.email = userInfo.email
            if (!user.googleId) user.googleId = userInfo.id
            if (!user.authProvider) user.authProvider = 'google'
            await user.save()
        }

        const token = createToken(user)
        const redirectTarget = `${FRONT_END_URL}/sign-in?token=${encodeURIComponent(token)}`
        return res.redirect(redirectTarget)
    } catch (err) {
        return res.status(500).json({ err: 'OAuth callback failed' })
    }
})

module.exports = router