import { onMount } from 'solid-js'
import { Outlet } from '@solidjs/router'
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Footer from '../components/Footer'
import Box from '@suid/material/Box'
import Container from '@suid/material/Container'
import CssBaseline from '@suid/material/CssBaseline'
import Toolbar from '@suid/material/Toolbar'

import { checkAuth } from '../common/auth_guard'

const BasicLayout = () => {
	onMount(checkAuth)

	return (
		<>
			<Header />
			<Box>
				<CssBaseline />
				<Toolbar />

				<Box sx={{ display: 'flex' }}>
					<SideBar></SideBar>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: 6 }}>
							<Outlet />
						</Container>
						<Footer />
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default BasicLayout
