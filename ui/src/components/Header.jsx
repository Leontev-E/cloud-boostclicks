import AppBar from '@suid/material/AppBar'
import Toolbar from '@suid/material/Toolbar'
import Typography from '@suid/material/Typography'
import IconButton from '@suid/material/IconButton'
import { A, useNavigate } from '@solidjs/router'
import LogoutIcon from '@suid/icons-material/Logout'
import Box from '@suid/material/Box'
import Chip from '@suid/material/Chip'

import AppIcon from './AppIcon'
import createLocalStore from '../../libs'

const Header = () => {
	const [store, setStore] = createLocalStore()
	const navigate = useNavigate()
	const userLabel = () => store.user?.displayName || store.user?.identifier

	const logout = (_) => {
		setStore('access_token', null)
		setStore('user', null)
		setStore('redirect', '/')

		navigate('/login')
	}

	return (
		<AppBar elevation={0} position="sticky">
			<Toolbar sx={{ justifyContent: 'space-between' }}>
				<A href="/">
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<AppIcon />
						<Typography variant="h5" noWrap sx={{ pl: 1.5 }}>
							cloud.boostclicks
						</Typography>
					</Box>
				</A>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					{userLabel() ? <Chip label={userLabel()} /> : null}
					<IconButton onClick={logout} aria-label="Logout">
						<LogoutIcon />
					</IconButton>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Header
