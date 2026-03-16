import { Link, NavLink } from 'react-router'
import { useContext } from 'react'
import { UserContext } from '../../context/UserContext'

const NavBar = () => {
    const { user, setUser } = useContext(UserContext)

    const handleSignOut = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <nav>
            { user ? (
                <ul>
                    <li><NavLink to='/' end>Feed</NavLink></li>
                    <li><NavLink to='/trips' end>My Trips</NavLink></li>
                    <li><NavLink to='/trips/new'>Add Trip</NavLink></li>
                    <li><NavLink to='/users'>Users</NavLink></li>
                    <li><Link to='/' onClick={handleSignOut}>Sign Out</Link></li>
                </ul>
            ) : (
                <ul>
                    <li><NavLink to='/' end>Home</NavLink></li>
                    <li><NavLink to='/sign-in'>Sign In</NavLink></li>
                    <li><NavLink to='/sign-up'>Sign Up</NavLink></li>
                </ul>
            )}
        </nav>
    )
}

export default NavBar
