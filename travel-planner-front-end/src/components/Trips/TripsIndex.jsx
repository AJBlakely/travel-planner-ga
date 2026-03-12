import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'

const TripsIndex = () => {
    const { user } = useContext(UserContext)
    const [trips, setTrips] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return

        const fetchTrips = async () => {
            try {
                const data = await tripService.listMine()
                setTrips(data.trips || [])
            } catch (err) {
                setError('Unable to load trips. Please try again.')
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTrips()
    }, [user])

    if (!user) {
        return (
            <main className='dashboard'>
                <h1>My Trips</h1>
                <p>You need to be signed in to view your trips.</p>
            </main>
        )
    }

    if (isLoading) {
        return (
            <main className='dashboard'>
                <h1>My Trips</h1>
                <p>Loading trips...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className='dashboard'>
                <h1>My Trips</h1>
                <p>{error}</p>
            </main>
        )
    }

    const mappedTrips = trips.map((trip) => {
        const tripId = trip._id || trip.id
        return (
            <li key={tripId || trip.location}>
                <strong>
                    {tripId ? (
                        <Link to={`/trips/${tripId}`}>{trip.location}</Link>
                    ) : (
                        trip.location
                    )}
                </strong>{' '}
            <span>
                ({new Date(trip.startDate).toLocaleDateString()} -{' '}
                {new Date(trip.endDate).toLocaleDateString()})
            </span>
            </li>
        )
    })

    return (
        <main className='dashboard'>
            <h1>My Trips</h1>
            {trips.length === 0 ? (
                <p>No trips yet. Add your first trip!</p>
            ) : (
                <ul className='dashboard-list'>
                    {mappedTrips}
                </ul>
            )}
        </main>
    )
}

export default TripsIndex
