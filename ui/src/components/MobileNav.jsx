import BottomNavigation from '@suid/material/BottomNavigation'
import BottomNavigationAction from '@suid/material/BottomNavigationAction'
import Paper from '@suid/material/Paper'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToyOutlined'
import HomeIcon from '@suid/icons-material/Home'
import { useLocation, useNavigate } from '@solidjs/router'

const MobileNav = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const items = [
		{ label: 'Главная', value: '/storages', icon: <HomeIcon /> },
		{ label: 'Облака', value: '/storages', icon: <StorageIcon /> },
		{ label: 'Боты', value: '/storage_workers', icon: <SmartToyIcon /> },
	]

	const current = () => {
		const found = items.find((item) => location.pathname.startsWith(item.value))
		return found ? found.value : '/storages'
	}

	return (
		<Paper
			elevation={10}
			sx={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: 1300,
				display: { xs: 'block', md: 'none' },
			}}
		>
			<BottomNavigation
				showLabels
				value={current()}
				onChange={(_, value) => navigate(value)}
				sx={{ height: 64 }}
			>
				{items.map((item) => (
					<BottomNavigationAction
						value={item.value}
						label={item.label}
						icon={item.icon}
						aria-label={item.label}
					/>
				))}
			</BottomNavigation>
		</Paper>
	)
}

export default MobileNav
