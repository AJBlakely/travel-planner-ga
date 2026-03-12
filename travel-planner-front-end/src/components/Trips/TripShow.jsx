import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'

const TripShow = () => {
    const { user } = useContext(UserContext)
    const { tripId } = useParams()
    const [trip, setTrip] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

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

    return (
        <main className='dashboard'>
            <h1>{trip.location}</h1>
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
        </main>
    )
}

export default TripShow
