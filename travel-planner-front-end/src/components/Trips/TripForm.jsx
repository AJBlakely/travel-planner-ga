import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'


const TripForm = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
    const { tripId } = useParams()
    const isEditMode = Boolean(tripId)
    const [message, setMessage] = useState('')
    const [formData, setFormData] = useState({
        location: '',
        accommodations: '',
        startDate: '',
        endDate: '',
        tips: '',
        photo: null
    })

    const [preview, setPreview] = useState(null)
    const [isLoading, setIsLoading] = useState(isEditMode)

    useEffect(() => {
        if (!isEditMode) return

        const fetchTrip = async () => {
            try {
                const data = await tripService.show(tripId)
                const trip = data.trip || {}

                setFormData({
                    location: trip.location || '',
                    accommodations: trip.accommodations || '',
                    startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : '',
                    endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : '',
                    tips: trip.tips || '',
                    photo: null,
                })

                if (trip.photoUrl) {
                    setPreview(trip.photoUrl)
                }
            } catch (err) {
                setMessage(err.message || 'Unable to load trip data.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTrip()
    }, [isEditMode, tripId])

    const handleFileChange = (evt) => {
        const file = evt.target.files[0]
        setFormData({ ...formData, photo: file })
        
        // Create a local URL for the preview image
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }


    const handleChange = (evt) => {
        setMessage('')
        setFormData({ ...formData, [evt.target.name]: evt.target.value })
    }

    const handleSubmit = async (evt) => {
        evt.preventDefault()
        try {
            const data = new FormData()
            data.append('location', formData.location)
            data.append('accommodations', formData.accommodations)
            data.append('startDate', formData.startDate)
            data.append('endDate', formData.endDate)
            data.append('tips', formData.tips)

            if (formData.photo instanceof File) {
                data.append('photo', formData.photo)
            }

            if (isEditMode) {
                await tripService.update(tripId, data)
                navigate(`/trips/${tripId}`)
            } else {
                await tripService.create(data)
                navigate('/')
            }
        } catch (err) {
            setMessage(err.message || 'Unable to save trip.')
        }
    }

    const handleCancel = () => {
        navigate(isEditMode ? `/trips/${tripId}` : '/')
    }

    if (!user) return <main className='dashboard'><p>Please sign in.</p></main>
    if (isLoading) return <main className='dashboard'><p>Loading trip...</p></main>

    return (
        <main className='dashboard'>
            <h2>{isEditMode ? 'Edit Trip' : 'Add Trip'}</h2>
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
                        placeholder='City or destination'
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
                
                {/* 4. Add the Photo Input Field */}
                <div>
                    <label htmlFor='photo'>Trip Photo:</label>
                    <input 
                        type='file' 
                        id='photo' 
                        name='photo' 
                        accept='image/*' 
                        onChange={handleFileChange} 
                    />
                    {preview && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={preview} alt="Preview" style={{ width: '100px', borderRadius: '8px' }} />
                        </div>
                    )}
                </div>

                <div>
                    <button type='submit'>{isEditMode ? 'Update Trip' : 'Save Trip'}</button>
                    <button type='button' className='danger-btn' onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </main>
    )
}


export default TripForm
