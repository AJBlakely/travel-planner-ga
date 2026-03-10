const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true //useful for auto-populated destinations
    },
    accommodations: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    tips: {
        type: String
    },
    // link the trip to the user who created it
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // embed comments to each trip
    comments: [commentSchema]
}, { timestamps: true });

// make sure the data is easy to navigate
tripSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const trip = mongoose.model('Trip', tripSchema)

module.exports = Trip