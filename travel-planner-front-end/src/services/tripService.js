import { getAuthHeaders, handleResponse } from './apiClient'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/trips`

const buildRequestOptions = (method, payload) => {
    const isFormData = payload instanceof FormData

    return {
        method,
        headers: getAuthHeaders(!isFormData),
        body: isFormData ? payload : JSON.stringify(payload),
    }
}

const create = async (formData) => {
    try {
        const res = await fetch(BASE_URL, buildRequestOptions('POST', formData))

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const listMine = async () => {
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

const listFeed = async () => {
    try {
        const res = await fetch(`${BASE_URL}/feed`, {
            headers: getAuthHeaders(),
        })

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const show = async (tripId) => {
    try {
        const res = await fetch(`${BASE_URL}/${tripId}`, {
            headers: getAuthHeaders(),
        })

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const update = async (tripId, formData) => {
    try {
        const res = await fetch(`${BASE_URL}/${tripId}`, buildRequestOptions('PUT', formData))

        return await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

// Delete an existing trip
const destroy = async (tripId) => {
    try {
        const res = await fetch(`${BASE_URL}/${tripId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })

        await handleResponse(res)
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

export {
    create,
    listMine,
    listFeed,
    show,
    update,
    destroy
}
