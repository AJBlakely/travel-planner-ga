const getAuthHeaders = (includeJson = false) => {
    const headers = {}
    const token = localStorage.getItem('token')

    if (includeJson) {
        headers['Content-Type'] = 'application/json'
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    return headers
}

const clearInvalidSession = () => {
    localStorage.removeItem('token')
    window.location.assign('/sign-in')
}

const parseJson = async (res) => {
    const text = await res.text()
    return text ? JSON.parse(text) : {}
}

const handleResponse = async (res) => {
    const data = await parseJson(res)

    if (res.status === 401) {
        clearInvalidSession()
        throw new Error(data.err || 'Your session has expired. Please sign in again.')
    }

    if (!res.ok || data.err) {
        throw new Error(data.err || 'Request failed.')
    }

    return data
}

export {
    getAuthHeaders,
    handleResponse,
}
