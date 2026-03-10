import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as userService from '../../services/userService'

const UserProfile = () => {
    const { user } = useContext(UserContext)
    const { userId } = useParams()

    const [profile, setProfile] = useState(null)
    const [trips, setTrips] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return

        const fetchProfileAndTrips = async () => {
            try {
                // first request user info 
                const profileData = await userService.show(userId)
                setProfile(profileData)

                // second request trips for user
                const tripsData = await userService.tripsForShow(userId)
                setTrips(tripsData)
            } catch (err) {
                setError('Unable to load this profile. Please try again.')
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfileAndTrips()
    }, [user, userId])

    if (!user) {
        return (
            <main>
                <h1>User Profile</h1>
                <p>You need to be signed in to view profiles.</p>
            </main>
        )
    }

    if (isLoading) {
        return (
            <main>
                <h1>User Profile</h1>
                <p>Loading profile...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main>
                <h1>User Profile</h1>
                <p>{error}</p>
            </main>
        )
    }

    if (!profile) {
        return (
            <main>
                <h1>User Profile</h1>
                <p>Profile not found.</p>
            </main>
        )
    }

    const mappedTrips = trips.map((trip) => (
        <li key={trip._id}>
            <strong>{trip.location}</strong>{' '}
            <span>
                ({new Date(trip.startDate).toLocaleDateString()} -{' '}
                {new Date(trip.endDate).toLocaleDateString()})
            </span>
        </li>
    ))

    return (
        <main>
            <h1>{profile.username}'s Profile</h1>
            <section>
                <p>User since: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</p>
            </section>

            <section>
                <h2>Trips</h2>
                {trips.length === 0 ? (
                    <p>No trips found for this user.</p>
                ) : (
                    <ul>
                        {mappedTrips}
                    </ul>
                )}
            </section>
        </main>
    )
}

export default UserProfile