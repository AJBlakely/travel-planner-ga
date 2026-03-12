import { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../context/UserContext'
import * as userService from '../../services/userService'

const Dashboard = () => {
    const { user } = useContext(UserContext)
    const [users, setUsers] = useState([])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await userService.index()
                setUsers(fetchedUsers)
            } catch (err) {
                console.log(err)
            }
        }
        if(user) fetchUsers()
    }, [user])

    const mappedUsers = users.map((user) => (
        <li key={user._id}>{user.username}</li>
    ))

    return (
        <main className='dashboard'>
            <h1>Welcome, {user.username}</h1>
            <ul className='dashboard-list'>
                {mappedUsers}
            </ul>
        </main>
    )
}

export default Dashboard
