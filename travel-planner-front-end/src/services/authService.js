const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`

const decodeJwtPayload = (token) => {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded)).payload
}

const setSessionFromToken = (token) => {
    localStorage.setItem('token', token)
    return decodeJwtPayload(token)
}

const signUp = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })

        const data = await res.json()

        if (data.err) {
            throw new Error(data.err)
        }

        if(data.token) {
            return setSessionFromToken(data.token)
        }

        throw new Error('invalid response from server')
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const signIn = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/sign-in`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await res.json()

        if(data.err) {
            throw new Error(data.err)
        }

        if(data.token) {
            return setSessionFromToken(data.token)
        }
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const signInWithGoogle = () => {
    window.location.assign(`${BASE_URL}/google`)
}

export {
    signUp,
    signIn,
    signInWithGoogle,
    setSessionFromToken
}
