import { Outlet } from '@solidjs/router'
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Footer from '../components/Footer'
import InstallPromptBanner from '../components/InstallPromptBanner'
import MobileNav from '../components/MobileNav'
import Box from '@suid/material/Box'
import Container from '@suid/material/Container'
import CssBaseline from '@suid/material/CssBaseline'

const BasicLayout = () => {
	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<CssBaseline />
			<Header />
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
				<Box sx={{ display: { xs: 'none', md: 'block' } }}>
					<SideBar />
				</Box>

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
						sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 9, md: 6 }, flex: 1 }}
					>
						<Outlet />
					</Container>
				</Box>
			</Box>
			<Footer />
			<MobileNav />
			<InstallPromptBanner />
		</Box>
	)
}

export default BasicLayout
