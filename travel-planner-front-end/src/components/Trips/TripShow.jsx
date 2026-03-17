import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'

const TripShow = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
    const location = useLocation()
    const { tripId } = useParams()
    const [trip, setTrip] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!user) return

        const fetchTrip = async () => {
            try {
                const data = await tripService.show(tripId)
                setTrip(data.trip || null)
            } catch (err) {
                setError('Unable to load this trip. Please try again.')
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTrip()
    }, [user, tripId])

    const handleEditClick = () => {
        navigate(`/trips/${tripId}/edit`)
    }

    const handleDeleteClick = async () => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return
        setIsDeleting(true)
        setError(null)
        try {
            await tripService.destroy(tripId)
            navigate('/')
        } catch (err) {
            setError(err.message || 'Unable to delete this trip.')
        } finally {
            setIsDeleting(false)
        }
    }

    if (!user) {
        return (
            <main className='dashboard'>
                <h1>Trip Details</h1>
                <p>You need to be signed in to view trips.</p>
            </main>
        )
    }

    if (isLoading) {
        return (
            <main className='dashboard'>
                <h1>Trip Details</h1>
                <p>Loading trip...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className='dashboard'>
                <h1>Trip Details</h1>
                <p>{error}</p>
            </main>
        )
    }

    if (!trip) {
        return (
            <main className='dashboard'>
                <h1>Trip Details</h1>
                <p>Trip not found.</p>
            </main>
        )
    }

    const tripOwnerId =
        typeof trip.user === 'string'
            ? trip.user
            : trip.user?._id || trip.user?.id
    const isOwner = tripOwnerId === user._id
    const fromFeed = location.state?.fromFeed === true

    return (
        <main className='dashboard'>
            <h1>{trip.location}</h1>
            {trip.photoUrl ? (
                <img
                    className='trip-show-photo'
                    src={trip.photoUrl}
                    alt={`Trip to ${trip.location}`}
                />
            ) : null}
            {trip.user?.username ? (
                <p><strong>Shared by:</strong> {trip.user.username}</p>
            ) : null}
            <p>
                {new Date(trip.startDate).toLocaleDateString()} -{' '}
                {new Date(trip.endDate).toLocaleDateString()}
            </p>
            {trip.accommodations ? (
                <p><strong>Accommodations:</strong> {trip.accommodations}</p>
            ) : null}
            {trip.tips ? (
                <p><strong>Tips:</strong> {trip.tips}</p>
            ) : null}
            {isOwner ? (
                <div>
                    <button type='button' onClick={handleEditClick}>
                        Edit Trip
                    </button>
                    <button
                        type='button'
                        className='danger-btn'
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        style={{ marginLeft: '1rem' }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Trip'}
                    </button>
                </div>
            ) : null}
            {fromFeed ? (
                <div style={{ marginTop: '1rem' }}>
                    <button type='button' onClick={() => navigate('/')}>
                        Back to Feed
                    </button>
                </div>
            ) : null}
        </main>
    )
}


export default TripShow
