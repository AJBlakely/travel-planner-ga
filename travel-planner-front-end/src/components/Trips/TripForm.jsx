import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'

const TripForm = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
    const [message, setMessage] = useState('')
    const [formData, setFormData] = useState({
        location: '',
        accommodations: '',
        startDate: '',
        endDate: '',
        tips: '',
    })

    const handleChange = (evt) => {
        setMessage('')
        setFormData({ ...formData, [evt.target.name]: evt.target.value })
    }

    const handleSubmit = async (evt) => {
        evt.preventDefault()
        try {
            await tripService.create(formData)
            navigate('/')
        } catch (err) {
            setMessage(err.message || 'Unable to save trip.')
        }
    }

    if (!user) {
        return (
            <main className='dashboard'>
                <h1>Add Trip</h1>
                <p>You need to be signed in to add a trip.</p>
            </main>
        )
    }

    return (
        <main className='dashboard'>
            <h1>Add Trip</h1>
            <p>{message}</p>
            <form autoComplete='off' onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='location'>Location:</label>
                    <input
                        type='text'
                        id='location'
                        name='location'
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='accommodations'>Accommodations:</label>
                    <input
                        type='text'
                        id='accommodations'
                        name='accommodations'
                        value={formData.accommodations}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor='startDate'>Start Date:</label>
                    <input
                        type='date'
                        id='startDate'
                        name='startDate'
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='endDate'>End Date:</label>
                    <input
                        type='date'
                        id='endDate'
                        name='endDate'
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='tips'>Tips/Recommendations:</label>
                    <textarea
                        id='tips'
                        name='tips'
                        value={formData.tips}
                        onChange={handleChange}
                        rows='4'
                    />
                </div>
                <div>
                    <button type='submit'>Save Trip</button>
                    <button type='button' onClick={() => navigate('/')}>Cancel</button>
                </div>
            </form>
        </main>
    )
}

export default TripForm
