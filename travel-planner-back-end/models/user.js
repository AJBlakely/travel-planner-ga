const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,
    },
    googleId: {
        type: String,
        sparse: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    password: {
        type: String,
        required: false,
    }
}, { timestamps: true })

userSchema.set('toJSON', { transform: (document, returnedObject) => {
    delete returnedObject.password
}})

const User = mongoose.model("User", userSchema)

module.exports = User