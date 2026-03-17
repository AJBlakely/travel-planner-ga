import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'

const Feed = () => {
    const { user } = useContext(UserContext)
    const [trips, setTrips] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const data = await tripService.listFeed()
                setTrips(data.trips || [])
            } catch (err) {
                setError('Unable to load the trip feed. Please try again.')
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchTrips()
        }
    }, [user])

    if (isLoading) {
        return (
            <main className='dashboard'>
                <h1>Trip Feed</h1>
                <p>Loading feed...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className='dashboard'>
                <h1>Trip Feed</h1>
                <p>{error}</p>
            </main>
        )
    }

    const mappedTrips = trips.map((trip) => {
        const tripId = trip._id || trip.id

        return (
            <li key={tripId} className='feed-card'>
                <h2 className='feed-title'>
                    Trip to {trip.location}
                </h2>
                <p className='feed-dates'>
                    {new Date(trip.startDate).toLocaleDateString()} -{' '}
                    {new Date(trip.endDate).toLocaleDateString()}
                </p>
                <Link className='feed-button' to={`/trips/${tripId}`} state={{ fromFeed: true }}>
                    See details
                </Link>
            </li>
        )
    })

    return (
        <main className='dashboard'>
            <h1>Trip Feed</h1>
            <p>Welcome, {user.username}. Explore what other travelers are sharing.</p>
            {trips.length === 0 ? (
                <p>No trips in the feed yet.</p>
            ) : (
                <ul className='dashboard-list feed-list'>
                    {mappedTrips}
                </ul>
            )}
        </main>
    )
}

export default Feed
