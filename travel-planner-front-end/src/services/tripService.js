const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/trips`

const create = async (formData) => {
    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (data.err) {
            throw new Error(data.err)
        }

        return data
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const listMine = async () => {
    try {
        const res = await fetch(BASE_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })

        const data = await res.json()

        if (data.err) {
            throw new Error(data.err)
        }

        return data
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const show = async (tripId) => {
    try {
        const res = await fetch(`${BASE_URL}/${tripId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })

        const data = await res.json()

        if (data.err) {
            throw new Error(data.err)
        }

        return data
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

export {
    create,
    listMine,
    show,
}
