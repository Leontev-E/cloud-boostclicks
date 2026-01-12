import Drawer from '@suid/material/Drawer'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import List from '@suid/material/List'
import Divider from '@suid/material/Divider'
import IconButton from '@suid/material/IconButton'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemText from '@suid/material/ListItemText'
import ListSubheader from '@suid/material/ListSubheader'
import { createSignal, mapArray, onMount, Show } from 'solid-js'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToyOutlined'
import { A } from '@solidjs/router'

import API from '../api'
import SideBarItem from './SideBarItem'
import createLocalStore from '../../libs'

const initOpen = window.innerWidth > 1024

const SideBar = () => {
	const [open, setOpen] = createSignal(initOpen)
	const [storages, setStorages] = createSignal([])
	const [store] = createLocalStore()

	const toggleDrawerOpen = () => {
		setOpen((open) => !open)
	}

	onMount(async () => {
		if (!store.access_token) {
			return
		}

		try {
			const storagesSchema = await API.storages.listStorages()
			setStorages(storagesSchema.storages || [])
		} catch {}
	})

	const recentStorages = () => storages().slice(0, 3)

	return (
		<Drawer
			variant="permanent"
			open
			classes={{
				paper: open()
					? 'drawer-paper drawer-paper-opened'
					: 'drawer-paper drawer-paper-closed',
			}}
		>
			<Paper
				elevation={0}
				sx={{
					m: 1,
					px: 1.5,
					py: 1,
					borderRadius: 2,
					border: '1px solid rgba(15,23,42,0.08)',
					backgroundColor: '#f8fafc',
					display: 'flex',
					alignItems: 'center',
					justifyContent: open() ? 'space-between' : 'center',
					gap: 1,
				}}
			>
				{open() && (
					<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
						Навигация
					</Typography>
				)}
				<IconButton
					onClick={toggleDrawerOpen}
					size="small"
					sx={{
						borderRadius: 2,
						border: '1px solid rgba(15,23,42,0.12)',
						backgroundColor: '#ffffff',
						'&:hover': { backgroundColor: '#f1f5f9' },
					}}
				>
					{open() ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
				</IconButton>
			</Paper>
			<Divider />
			<List>
				<SideBarItem text="Облака" link="/storages" isFull={open()}>
					<StorageIcon />
				</SideBarItem>
				<SideBarItem text="Боты" link="/storage_workers" isFull={open()}>
					<SmartToyIcon />
				</SideBarItem>
			</List>
			<Show when={open() && recentStorages().length}>
				<Divider />
				<List
					subheader={
						<ListSubheader
							component="div"
							disableSticky
							sx={{ bgcolor: 'transparent', lineHeight: 1.4 }}
						>
							Последние облака
						</ListSubheader>
					}
				>
					{mapArray(recentStorages, (storage) => (
						<ListItem disablePadding>
							<A href={`/storages/${storage.id}/files`}>
								<ListItemButton sx={{ pl: 4, pr: 2.5, py: 0.75 }}>
									<ListItemText
										primary={storage.name}
										primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
									/>
								</ListItemButton>
							</A>
						</ListItem>
					))}
				</List>
			</Show>
		</Drawer>
	)
}

export default SideBar
