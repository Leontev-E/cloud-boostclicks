import { Routes, Route } from '@solidjs/router'
import { ThemeProvider, createTheme } from '@suid/material'

import Login from './pages/Login'
import BasicLayout from './layouts/Basic'
import Storages from './pages/Storages'
import StorageCreateForm from './pages/Storages/StorageCreateForm'
import AlertStack from './components/AlertStack'
import StorageWorkers from './pages/StorageWorkers'
import StorageWorkerCreateForm from './pages/StorageWorkers/StorageWorkerCreateForm'
import Files from './pages/Files'
import UploadFileTo from './pages/Files/UploadFileTo'
import Register from './pages/Register'
import NotFound from './pages/404'
import Share from './pages/Share'
import Home from './pages/Home'

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#2c5f5d',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#f6a04d',
			contrastText: '#1b1a17',
		},
		background: {
			default: '#f7f1e8',
			paper: '#ffffff',
		},
		text: {
			primary: '#1b1a17',
			secondary: '#5f5a52',
		},
	},
	shape: {
		borderRadius: 18,
	},
	typography: {
		fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
		h1: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' },
		h2: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' },
		h3: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' },
		h4: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' },
		h5: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' },
		h6: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' },
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: 'rgba(255,255,255,0.86)',
					color: '#1b1a17',
					backdropFilter: 'blur(16px)',
					borderBottom: '1px solid rgba(27,26,23,0.08)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					border: '1px solid rgba(27,26,23,0.08)',
					boxShadow: '0 24px 60px rgba(27,26,23,0.12)',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: 14,
					fontWeight: 600,
				},
			},
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					backgroundColor: 'rgba(255,255,255,0.88)',
					backdropFilter: 'blur(16px)',
					borderRight: '1px solid rgba(27,26,23,0.08)',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 600,
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				head: {
					fontWeight: 600,
				},
			},
		},
	},
})

const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<Routes>
				<Route path="/" component={Home} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
				<Route path="/share/:id" component={Share} />

				<Route path="/" component={BasicLayout}>
					<Route path="/storages" component={Storages} />
					<Route path="/storages/register" component={StorageCreateForm} />
					<Route path="/storages/:id/files/*path" component={Files} />
					<Route path="/storages/:id/upload_to" component={UploadFileTo} />
					<Route path="/storage_workers" component={StorageWorkers} />
					<Route
						path="/storage_workers/register"
						component={StorageWorkerCreateForm}
					/>
					<Route path="*404" component={NotFound} />
				</Route>
			</Routes>

			<AlertStack />
		</ThemeProvider>
	)
}

export default App
