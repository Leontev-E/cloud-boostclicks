import AppBar from '@suid/material/AppBar'
import Toolbar from '@suid/material/Toolbar'
import Typography from '@suid/material/Typography'
import IconButton from '@suid/material/IconButton'
import { A, useNavigate } from '@solidjs/router'
import LogoutIcon from '@suid/icons-material/Logout'
import Box from '@suid/material/Box'
import Chip from '@suid/material/Chip'
import Button from '@suid/material/Button'
import { Show } from 'solid-js'

import AppIcon from './AppIcon'
import createLocalStore from '../../libs'

const Header = () => {
	const [store, setStore] = createLocalStore()
	const navigate = useNavigate()
	const userLabel = () => store.user?.displayName || store.user?.identifier
	const isAuthenticated = () => Boolean(store.access_token)

	const logout = (_) => {
		setStore('access_token', null)
		setStore('user', null)
		setStore('redirect', '/')

		navigate('/login')
	}

	return (
		<AppBar
			elevation={0}
			position="sticky"
			sx={{
				backgroundColor: '#ffffff',
				borderBottom: '1px solid rgba(15,23,42,0.08)',
				color: '#0f172a',
			}}
		>
			<Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
				<A href="/">
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<AppIcon />
						<Typography variant="h5" noWrap sx={{ pl: 0.5, fontWeight: 800 }}>
							cloud.boostclicks
						</Typography>
					</Box>
				</A>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Button variant="text" component="a" href="/storages">
						Облака
					</Button>
					<Button variant="text" component="a" href="/storage_workers">
						Боты
					</Button>
					<Show
						when={isAuthenticated()}
						fallback={
							<Button variant="outlined" onClick={() => navigate('/login')}>
								Войти
							</Button>
						}
					>
						{userLabel() ? <Chip label={userLabel()} /> : null}
						<IconButton onClick={logout} aria-label="Logout">
							<LogoutIcon />
						</IconButton>
					</Show>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Header
