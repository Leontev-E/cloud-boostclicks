import { useLocation, useNavigate } from '@solidjs/router'
import createLocalStore from '../../libs'

const decodeJwt = (token) => {
	if (!token) return null
	const parts = token.split('.')
	if (parts.length !== 3) return null
	try {
		const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
		return JSON.parse(payload)
	} catch (_) {
		return null
	}
}

export function checkAuth() {
	const [store, setStore] = createLocalStore()
	const navigate = useNavigate()
	const location = useLocation()

	const claims = decodeJwt(store.access_token)
	const now = Math.floor(Date.now() / 1000)
	const isExpired = claims?.exp && claims.exp < now

	if (!store.access_token || isExpired) {
		setStore('access_token', null)
		setStore('user', null)
		setStore('redirect', location.pathname)

		navigate('/login')
	}
}
