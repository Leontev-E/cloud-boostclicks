import { onMount } from 'solid-js'
import { Outlet } from '@solidjs/router'
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Footer from '../components/Footer'
import InstallPromptBanner from '../components/InstallPromptBanner'
import Box from '@suid/material/Box'
import Container from '@suid/material/Container'
import CssBaseline from '@suid/material/CssBaseline'

import { checkAuth } from '../common/auth_guard'

const BasicLayout = () => {
	onMount(checkAuth)

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<CssBaseline />
			<Header />
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
				<SideBar></SideBar>

				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Container
						maxWidth="lg"
						sx={{ pt: { xs: 3, md: 5 }, pb: 6, flex: 1 }}
					>
						<Outlet />
					</Container>
					<Footer />
				</Box>
			</Box>
			<InstallPromptBanner />
		</Box>
	)
}

export default BasicLayout
