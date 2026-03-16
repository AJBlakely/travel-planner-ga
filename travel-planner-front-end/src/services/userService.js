import { getAuthHeaders, handleResponse } from './apiClient'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`

const index = async () => {
    try {
        const res = await fetch(BASE_URL, {
            headers: getAuthHeaders(),
        })

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const show = async (userId) => {
    try {
        const res = await fetch(`${BASE_URL}/${userId}`, {
            headers: getAuthHeaders(),
        })

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}


const tripsForShow = async (userId) => {
    try {
        const res = await fetch(`${BASE_URL}/${userId}/trips`, {
            headers: getAuthHeaders(),
        })

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}



export {
    index,
    show,
    tripsForShow
}
