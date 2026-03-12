import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as userService from '../../services/userService'


const UsersList = () => {
    const { user } = useContext(UserContext)
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        
        if (!user) return
        
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await userService.index()
                setUsers(fetchedUsers)
            } catch (err) {
                setError('Unable to load users. Please try again.')
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchUsers()
    }, [user])
    
    //  there is no logged-in user
    if (!user) {
        return (
        <main className='dashboard'>
            <h1>Users</h1>
            <p>You need to be signed in to view the list of users.</p>
        </main>
        )
    }

    if (isLoading) {
        return (
        <main className='dashboard'>
            <h1>Users</h1>
            <p>Loading users...</p>
        </main>
        )
    }

    if (error) {
        return (
        <main className='dashboard'>
            <h1>Users</h1>
            <p>{error}</p>
        </main>
        )
    }

    //create one <li> for each user, wrap in a <Link> which navigates to that user's profile route (/users/:userId).
    const mappedUsers = users.map((item) => (
        <li key={item._id}>
            <Link to={`/users/${item._id}`}>{item.username}</Link>
        </li>
    ))

    return (
        <main className='dashboard'>
            <h1>Users</h1>
            <p>Select a user to view their profile.</p>
            <ul className='dashboard-list'>
                {mappedUsers}
            </ul>
        </main>
    )
}

export default UsersList
