import { useParams } from '@solidjs/router'
import {
	For,
	Show,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
} from 'solid-js'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import CircularProgress from '@suid/material/CircularProgress'
import Container from '@suid/material/Container'
import CssBaseline from '@suid/material/CssBaseline'
import List from '@suid/material/List'
import ListItem from '@suid/material/ListItem'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@suid/icons-material/Folder'

import API from '../api'
import { alertStore } from '../components/AlertStack'

const textExtensions = new Set(['txt', 'md', 'csv', 'json', 'log'])
const officeExtensions = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])

const getExtension = (name = '') => {
	const parts = name.toLowerCase().split('.')
	return parts.length > 1 ? parts[parts.length - 1] : ''
}

const getPreviewMode = (blobType, name) => {
	const ext = getExtension(name)
	if (officeExtensions.has(ext)) return 'office'
	if (blobType.startsWith('image/')) return 'image'
	if (blobType.startsWith('video/')) return 'video'
	if (blobType.startsWith('audio/')) return 'audio'
	if (blobType === 'application/pdf' || ext === 'pdf') return 'pdf'
	if (blobType.startsWith('text/') || textExtensions.has(ext)) return 'text'
	return 'unsupported'
}

const Share = () => {
	const params = useParams()
	const { addAlert } = alertStore

	const [share, setShare] = createSignal()
	const [items, setItems] = createSignal([])
	const [status, setStatus] = createSignal('loading')
	const [previewStatus, setPreviewStatus] = createSignal('idle')
	const [previewType, setPreviewType] = createSignal('')
	const [previewUrl, setPreviewUrl] = createSignal('')
	const [previewText, setPreviewText] = createSignal('')

	const resetPreview = () => {
		if (previewUrl()) {
			URL.revokeObjectURL(previewUrl())
		}
		setPreviewUrl('')
		setPreviewText('')
		setPreviewType('')
		setPreviewStatus('idle')
	}

	const fetchShare = async () => {
		try {
			const info = await API.shares.getShare(params.id)
			setShare(info)

			if (info.is_folder) {
				const list = await API.shares.listSharedFolder(params.id)
				setItems(list || [])
			}

			setStatus('ready')
		} catch (err) {
			setStatus('error')
		}
	}

	const downloadFile = async () => {
		try {
			const blob = await API.shares.downloadShared(params.id)
			const href = URL.createObjectURL(blob)
			const a = Object.assign(document.createElement('a'), {
				href,
				style: 'display: none',
				download: share()?.name || 'file',
			})
			document.body.appendChild(a)
			a.click()
			URL.revokeObjectURL(href)
			a.remove()
		} catch (err) {
			addAlert('Не удалось скачать файл', 'error')
		}
	}

	const downloadFolder = async () => {
		try {
			const blob = await API.shares.downloadSharedFolder(params.id)
			const href = URL.createObjectURL(blob)
			const a = Object.assign(document.createElement('a'), {
				href,
				style: 'display: none',
				download: `${share()?.name || 'folder'}.zip`,
			})
			document.body.appendChild(a)
			a.click()
			URL.revokeObjectURL(href)
			a.remove()
		} catch (err) {
			addAlert('Не удалось скачать папку', 'error')
		}
	}

	createEffect(() => {
		if (!share() || share().is_folder) {
			resetPreview()
			return
		}

		let canceled = false
		resetPreview()
		setPreviewStatus('loading')

		const ext = getExtension(share().name)
		if (officeExtensions.has(ext)) {
			const downloadUrl = `${window.location.origin}/api/shares/${params.id}/download`
			setPreviewType('office')
			setPreviewUrl(
				`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
					downloadUrl
				)}`
			)
			setPreviewStatus('ready')
			return
		}

		API.shares
			.downloadShared(params.id)
			.then(async (blob) => {
				if (canceled) return
				const mode = getPreviewMode(blob.type, share().name)
				setPreviewType(mode)

				if (mode === 'text') {
					const text = await blob.text()
					if (canceled) return
					setPreviewText(text)
				} else if (mode !== 'unsupported') {
					const url = URL.createObjectURL(blob)
					setPreviewUrl(url)
				}

				setPreviewStatus('ready')
			})
			.catch(() => {
				if (!canceled) {
					setPreviewStatus('error')
				}
			})

		onCleanup(() => {
			canceled = true
		})
	})

	onMount(fetchShare)

	return (
		<Box sx={{ minHeight: '100vh', background: '#f7f1e8' }}>
			<CssBaseline />
			<Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
				<Paper sx={{ p: { xs: 3, md: 4 } }}>
					<Show when={status() === 'loading'}>
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
							<CircularProgress />
						</Box>
					</Show>

					<Show when={status() === 'error'}>
						<Typography color="error">
							Ссылка не найдена или больше не активна.
						</Typography>
					</Show>

					<Show when={status() === 'ready'}>
						<Typography variant="h4" sx={{ mb: 1 }}>
							{share()?.name}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							{share()?.is_folder ? 'Публичная папка' : 'Публичный файл'}
						</Typography>

						<Show
							when={!share()?.is_folder}
							fallback={
								<Box>
									<Button variant="contained" onClick={downloadFolder}>
										Скачать папку
									</Button>
									<Show when={!items().length}>
										<Typography color="text.secondary" sx={{ mt: 2 }}>
											Папка пуста.
										</Typography>
									</Show>
									<List sx={{ mt: 3 }}>
										<For each={items()}>
											{(item) => (
												<ListItem>
													<ListItemIcon>
														{item.is_file ? <FileIcon /> : <FolderIcon />}
													</ListItemIcon>
													<ListItemText primary={item.name} />
												</ListItem>
											)}
										</For>
									</List>
								</Box>
							}
						>
							<Button variant="contained" onClick={downloadFile} sx={{ mb: 3 }}>
								Скачать файл
							</Button>

							<Show when={previewStatus() === 'loading'}>
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
									<CircularProgress />
								</Box>
							</Show>

							<Show when={previewStatus() === 'error'}>
								<Typography color="error">
									Не удалось открыть файл. Попробуйте скачать его.
								</Typography>
							</Show>

							<Show when={previewStatus() === 'ready' && previewType() === 'image'}>
								<Box sx={{ display: 'flex', justifyContent: 'center' }}>
									<img
										src={previewUrl()}
										alt={share()?.name || 'file'}
										style="max-width: 100%; max-height: 70vh;"
									/>
								</Box>
							</Show>

							<Show when={previewStatus() === 'ready' && previewType() === 'video'}>
								<video
									controls
									src={previewUrl()}
									style="width: 100%; max-height: 70vh;"
								/>
							</Show>

							<Show when={previewStatus() === 'ready' && previewType() === 'audio'}>
								<audio controls src={previewUrl()} style="width: 100%;" />
							</Show>

							<Show when={previewStatus() === 'ready' && previewType() === 'pdf'}>
								<iframe
									src={previewUrl()}
									title="PDF preview"
									style="width: 100%; height: 70vh; border: none;"
								/>
							</Show>

							<Show when={previewStatus() === 'ready' && previewType() === 'text'}>
								<Box
									sx={{
										maxHeight: '70vh',
										overflow: 'auto',
										backgroundColor: 'rgba(0,0,0,0.03)',
										borderRadius: 2,
										padding: 2,
									}}
								>
									<pre style="margin: 0; white-space: pre-wrap;">
										{previewText()}
									</pre>
								</Box>
							</Show>

							<Show
								when={previewStatus() === 'ready' && previewType() === 'office'}
							>
								<iframe
									src={previewUrl()}
									title="Office preview"
									style="width: 100%; height: 70vh; border: none;"
								/>
							</Show>

							<Show
								when={previewStatus() === 'ready' && previewType() === 'unsupported'}
							>
								<Typography>
									Предпросмотр недоступен для этого типа файла. Скачайте файл,
									чтобы открыть его.
								</Typography>
							</Show>
						</Show>
					</Show>
				</Paper>
			</Container>
		</Box>
	)
}

export default Share
