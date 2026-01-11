import { Routes, Route, Navigate } from '@solidjs/router'
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

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#1b6ef3', contrastText: '#ffffff' },
		secondary: { main: '#f59e0b', contrastText: '#0f172a' },
		background: { default: '#f5f7fb', paper: '#ffffff' },
		text: { primary: '#0f172a', secondary: '#4b5565' },
	},
	shape: { borderRadius: 16 },
	typography: {
		fontFamily: '"Inter", "Segoe UI", sans-serif',
		h1: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 800 },
		h2: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 800 },
		h3: { fontFamily: '"Space Grotesk", "Segoe UI", sans-serif', fontWeight: 700 },
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: 'rgba(255,255,255,0.9)',
					color: '#0f172a',
					backdropFilter: 'blur(16px)',
					borderBottom: '1px solid rgba(15,23,42,0.08)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					border: '1px solid rgba(15,23,42,0.06)',
					boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: 14,
					fontWeight: 700,
					minHeight: 44,
					boxShadow: 'none',
					'&:hover': {
						boxShadow: '0 12px 28px rgba(27,110,243,0.18)',
					},
					'&:focus-visible': {
						outline: '2px solid #1b6ef3',
						outlineOffset: 2,
					},
				},
			},
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					backgroundColor: 'rgba(255,255,255,0.92)',
					backdropFilter: 'blur(16px)',
					borderRight: '1px solid rgba(15,23,42,0.08)',
				},
			},
		},
		MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
		MuiTableCell: { styleOverrides: { head: { fontWeight: 700 } } },
		MuiContainer: {
			styleOverrides: {
				root: {
					paddingLeft: '16px',
					paddingRight: '16px',
				},
			},
		},
	},
})

const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<Routes>
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
				<Route path="/share/:id" component={Share} />

				<Route path="/" component={BasicLayout}>
					<Route path="/" element={<Navigate href="/storages" />} />
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
