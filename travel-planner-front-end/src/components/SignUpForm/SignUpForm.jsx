import { useState, useContext } from 'react'
import { useNavigate } from 'react-router'
import { signUp } from '../../services/authService'

import { UserContext } from '../../context/UserContext'

const SignUpForm = () => {
    const navigate = useNavigate()
    const { setUser } = useContext(UserContext)
    const [message, setMessage] = useState('')
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        passwordConfirm: '',
    })

    const { username, password, passwordConfirm } = formData

    const isFormInvalid = () => {
        return !(username && password && password === passwordConfirm)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const newUser = await signUp(formData)
            setUser(newUser)
            navigate('/')
        } catch (err) {
            setMessage(err.message)
        }
    }

    const handleChange = (e) => {
        setMessage('')
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    
    return (
        <main>
            <h1>Sign Up</h1>
            <p>{message}</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='username'>Username: </label>
                    <input 
                        type='text'
                        id='name'
                        value={username}
                        name='username'
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='password'>Password: </label>
                    <input 
                        type='password'
                        id='password'
                        value={password}
                        name='password'
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='passwordConfirm'>Confirm Password: </label>
                    <input 
                        type='password'
                        id='confirm'
                        value={passwordConfirm}
                        name='passwordConfirm'
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <button disabled={isFormInvalid()}>Sign Up</button>
                    <button onClick={() => navigate('/')}>Cancel</button>
                </div>
            </form>
        </main>
    )
}

export default SignUpForm;