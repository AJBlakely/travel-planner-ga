import { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { importLibrary, setOptions } from "@googlemaps/js-api-loader"
import { UserContext } from '../../context/UserContext'
import * as tripService from '../../services/tripService'

setOptions({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    id: "google-maps-script"
})


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
    })

    const googleContainerRef = useRef(null)

    useEffect(() => {
        const init = async () => {
            try {
                // Wait for library to load
                const { PlaceAutocompleteElement } = await importLibrary("places");
                
                const autocomplete = new PlaceAutocompleteElement({
                    types: ['(cities)'],
                });

                if (formData.location) {
                    autocomplete.value = formData.location;
                }

                autocomplete.addEventListener('gmp-placeselect', async ({ place }) => {
                    await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
                    setFormData(prev => ({ 
                        ...prev, 
                        location: place.formattedAddress || place.displayName 
                    }));
                });

                if (googleContainerRef.current) {
                    googleContainerRef.current.innerHTML = ''; 
                    googleContainerRef.current.appendChild(autocomplete);
                }
            } catch (error) {
                console.error("Maps load error:", error);
            }
        };

        init();
    }, []); 

    const handleChange = (evt) => {
        setMessage('')
        setFormData({ ...formData, [evt.target.name]: evt.target.value })
    }

    const handleSubmit = async (evt) => {
        evt.preventDefault()
        try {
            if (isEditMode) {
                await tripService.update(tripId, formData)
                navigate(`/trips/${tripId}`)
            } else {
                await tripService.create(formData)
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

    return (
        <main className='dashboard'>
            <h1>{isEditMode ? 'Edit Trip' : 'Add Trip'}</h1>
            <p>{message}</p>
            <form autoComplete='off' onSubmit={handleSubmit}>
                <div>
                    <label>Location:</label>
                    {/* Google will inject the input into this div */}
                    <div ref={googleContainerRef} className="google-autocomplete-container"></div>
                </div>
                <div>
                    <label htmlFor='accommodations'>Accommodations:</label>
                    <input type='text' id='accommodations' name='accommodations' value={formData.accommodations} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor='startDate'>Start Date:</label>
                    <input type='date' id='startDate' name='startDate' value={formData.startDate} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor='endDate'>End Date:</label>
                    <input type='date' id='endDate' name='endDate' value={formData.endDate} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor='tips'>Tips/Recommendations:</label>
                    <textarea id='tips' name='tips' value={formData.tips} onChange={handleChange} rows='4' />
                </div>
                <div>
                    <button type='submit'>{isEditMode ? 'Update Trip' : 'Save Trip'}</button>
                    <button type='button' onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </main>
    )
}


export default TripForm
