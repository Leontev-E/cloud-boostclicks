import { useBeforeLeave, useParams } from '@solidjs/router'
import { Show, createSignal, mapArray, onCleanup, onMount } from 'solid-js'
import MenuItem from '@suid/material/MenuItem'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import UploadFileIcon from '@suid/icons-material/UploadFile'
import UploadFolderIcon from '@suid/icons-material/DriveFolderUpload'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Paper from '@suid/material/Paper'
import LinearProgress from '@suid/material/LinearProgress'
import Box from '@suid/material/Box'
import Skeleton from '@suid/material/Skeleton'
import FormControl from '@suid/material/FormControl'
import Select from '@suid/material/Select'
import InputLabel from '@suid/material/InputLabel'
import MenuItemMUI from '@suid/material/MenuItem'
import Button from '@suid/material/Button'

import API from '../../api'
import FSListItem from '../../components/FSListItem'
import Menu from '../../components/Menu'
import CreateFolderDialog from '../../components/CreateFolderDialog'
import { alertStore } from '../../components/AlertStack'
import { checkAuth } from '../../common/auth_guard'
import createLocalStore from '../../../libs'

const Files = () => {
	const { addAlert } = alertStore
	/**
	 * @type {[import("solid-js").Accessor<import("../../api").FSElement[]>, any]}
	 */
	const [fsLayer, setFsLayer] = createSignal([])
	/**
	 * @type {[import("solid-js").Accessor<import("../../api").Storage>, any]}
	 */
	const [storage, setStorage] = createSignal()
	const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
		createSignal(false)
	const [isUploading, setIsUploading] = createSignal(false)
	const [uploadProgress, setUploadProgress] = createSignal(0)
	const [uploadNote, setUploadNote] = createSignal('')
	const [isDownloading, setIsDownloading] = createSignal(false)
	const [downloadProgress, setDownloadProgress] = createSignal(0)
	const [downloadName, setDownloadName] = createSignal('')
	const [isLoading, setIsLoading] = createSignal(true)
	const [page, setPage] = createSignal(1)
	const [pageSize, setPageSize] = createSignal(20)
	const params = useParams()
	const basePath = `/storages/${params.id}/files`

	let uploadFileInputElement

	const decodePath = (value) => {
		if (!value) {
			return ''
		}

		try {
			return decodeURIComponent(value)
		} catch (err) {
			return value
		}
	}

	const getCurrentPath = () => decodePath(params.path || '')

	const fetchStorage = async () => {
		const storage = await API.storages.getStorage(params.id)
		setStorage(storage)
	}

	const fetchFSLayer = async (path = params.path) => {
		setIsLoading(true)
		try {
			const safePath = decodePath(path || '')
			const fsLayerRes = await API.files.getFSLayer(params.id, safePath)

			if (safePath.length) {
				const parentPath = safePath.split('/').slice(0, -1).join('/')
				const backToParent = { is_file: false, name: '..', path: parentPath }

				fsLayerRes.splice(0, 0, backToParent)
			}

			setFsLayer(fsLayerRes)
			setPage(1)
		} finally {
			setIsLoading(false)
		}
	}

	const reload = async () => {
		if (window.location.pathname.startsWith(basePath)) {
			await fetchFSLayer()
		}
	}

	onMount(() => {
		checkAuth()
		Promise.all([fetchStorage(), fetchFSLayer()]).then()

		// Either me or the solidjs-router creator is dumb af so I have to use this sht
		window.addEventListener('popstate', reload, false)
	})

	onCleanup(() => window.removeEventListener('popstate', reload, false))

	useBeforeLeave(async (e) => {
		if (e.to.startsWith(basePath)) {
			let newPath = e.to.slice(basePath.length)

			if (newPath.startsWith('/')) {
				newPath = newPath.slice(1)
			}

			await fetchFSLayer(newPath)
		}
	})

	const openCreateFolderDialog = () => {
		setIsCreateFolderDialogOpen(true)
	}
	const closeCreateFolderDialog = () => {
		setIsCreateFolderDialogOpen(false)
	}

	/**
	 *
	 * @param {string} folderName
	 */
	const createFolder = async (folderName) => {
		const currentPath = getCurrentPath()
		const basePath = currentPath.endsWith('/')
			? currentPath.slice(0, -1)
			: currentPath

		await API.files.createFolder(params.id, basePath, folderName)
		addAlert(`Папка "${folderName}" создана`, 'success')
		await fetchFSLayer()
	}

	const uploadFileClickHandler = () => {
		uploadFileInputElement.click()
	}

	/**
	 *
	 * @param {Event} event
	 */
	const uploadFile = async (event) => {
		const files = Array.from(event.target.files || [])
		if (!files.length) {
			return
		}

		event.target.value = null
		const currentPath = getCurrentPath()
		setIsUploading(true)
		setUploadProgress(0)
		setUploadNote('')
		const totalSize = files.reduce((sum, f) => sum + f.size, 0) || 1
		const chunkSize = 20 * 1024 * 1024
		let uploaded = 0

		try {
			for (const file of files) {
				// финальный путь включает имя файла (без трailing slash)
				const basePath = currentPath
					? currentPath.replace(/\\/g, '/').replace(/\/+$/, '')
					: ''
				const targetPath = basePath ? `${basePath}/${file.name}` : file.name
				let fileId
				let offset = 0
				const totalChunks = Math.ceil(file.size / chunkSize)

				if (file.size > 100 * 1024 * 1024) {
					addAlert(
						`Файл больше 100 МБ. Добавьте больше ботов в облако/канал для ускорения загрузки.`,
						'info'
					)
				}

				while (offset < file.size) {
					const chunk = file.slice(offset, offset + chunkSize)
					const chunkIndex = Math.floor(offset / chunkSize)
					let prevLoaded = 0

					try {
						const res = await API.files.uploadFileChunked(
							params.id,
							targetPath,
							chunk,
							chunkIndex,
							totalChunks,
							fileId,
							file.size,
							(loaded) => {
								const delta = loaded - prevLoaded
								prevLoaded = loaded
								const pct = Math.round(
									((uploaded + offset + loaded) / totalSize) * 100
								)
								setUploadProgress(Math.min(99, pct))
								setUploadNote('Дождитесь завершения — файл докачивается в Telegram')
							}
						)
						if (typeof res === 'string') fileId = res
						else if (res?.file_id) fileId = res.file_id
					} catch (err) {
						throw err
					}

					uploaded += chunk.size
					offset += chunkSize
				}

				addAlert(`Файл "${file.name}" загружен`, 'success')
				setUploadProgress(100)
				setUploadNote('Финализация загрузки...')
			}
			await fetchFSLayer()
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
			setUploadNote('')
		}
	}

	const handleDownloadStart = (name) => {
		setIsDownloading(true)
		setDownloadName(name)
		setDownloadProgress(0)
	}
	const handleDownloadProgress = (pct) => {
		if (pct === null) return
		setDownloadProgress(pct)
	}
const handleDownloadEnd = () => {
	setIsDownloading(false)
	setDownloadName('')
	setDownloadProgress(0)
}

const paginatedItems = () => {
	const items = fsLayer()
	const hasParent = items[0]?.name === '..'
	const rest = hasParent ? items.slice(1) : items
	const pages = Math.max(1, Math.ceil(rest.length / pageSize()))
	const currentPage = Math.min(page(), pages)
	const start = (currentPage - 1) * pageSize()
	const sliced = rest.slice(start, start + pageSize())
	return hasParent ? [items[0], ...sliced] : sliced
}

const totalPages = () => {
	const items = fsLayer()
	const rest = items[0]?.name === '..' ? items.slice(1) : items
	return Math.max(1, Math.ceil(rest.length / pageSize()))
}

	return (
		<>
			<Stack container>
				<Grid container sx={{ mb: 2 }} spacing={2} alignItems="center">
					<Grid item xs={12} md={7}>
						<Typography variant="h4">{storage()?.name}</Typography>
						<Typography variant="body2" color="text.secondary">
							Клик по файлу — инфа. Клик по папке — переход внутрь.
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Рекомендуем добавить до 20 ботов в TG-канал для ускорения работы.
						</Typography>
					</Grid>

					<Grid
						item
						xs={12}
						md={5}
						sx={{
							display: 'flex',
							justifyContent: { xs: 'flex-start', md: 'flex-end' },
						}}
					>
						<Menu button_title="Загрузить">
							<MenuItem onClick={openCreateFolderDialog}>
								<ListItemIcon>
									<UploadFolderIcon />
								</ListItemIcon>
								<ListItemText>Папку</ListItemText>
							</MenuItem>
							<MenuItem onClick={uploadFileClickHandler}>
								<ListItemIcon>
									<UploadFileIcon />
								</ListItemIcon>
								<ListItemText>Файлы</ListItemText>
							</MenuItem>
						</Menu>
					</Grid>
				</Grid>
				<Show when={isUploading()}>
					<LinearProgress sx={{ mb: 2 }} />
				</Show>

				<Grid>
					<Show when={isUploading()}>
						<Box sx={{ px: 1, pb: 1.5 }}>
							<LinearProgress variant="determinate" value={uploadProgress()} />
							<Typography variant="caption" color="text.secondary">
								Загрузка файлов в облако: {uploadProgress()}%
								{uploadNote() ? ` · ${uploadNote()}` : ''}
							</Typography>
						</Box>
					</Show>
					<Show when={isDownloading()}>
						<Box sx={{ px: 1, pb: 1.5 }}>
							<LinearProgress variant="determinate" value={downloadProgress()} />
							<Typography variant="caption" color="text.secondary">
								Скачивание: {downloadName()} · {downloadProgress()}%
							</Typography>
						</Box>
					</Show>

					<Show
						when={!isLoading() && fsLayer().length}
						fallback={
							<Paper sx={{ p: 3, textAlign: 'center' }}>
								<Show
									when={!isLoading()}
									fallback={
										<Stack spacing={1.2}>
											{Array.from({ length: 4 }).map(() => (
												<Paper sx={{ p: 2, borderRadius: 2 }}>
													<Skeleton variant="text" width="60%" />
													<Skeleton variant="text" width="40%" />
												</Paper>
											))}
										</Stack>
									}
								>
									<Typography variant="h6">В этой папке пока пусто</Typography>
									<Typography variant="body2" color="text.secondary">
										Создайте папку или загрузите первые файлы.
									</Typography>
								</Show>
							</Paper>
						}
					>
						<Stack spacing={1.25}>
								{mapArray(paginatedItems, (fsElement) => (
									<FSListItem
										fsElement={fsElement}
										storageId={params.id}
										onDelete={fetchFSLayer}
										onDownloadStart={handleDownloadStart}
										onDownloadProgress={handleDownloadProgress}
										onDownloadEnd={handleDownloadEnd}
									/>
								))}
						</Stack>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mt: 2,
								gap: 2,
								flexWrap: 'wrap',
							}}
						>
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel id="page-size-label">На странице</InputLabel>
								<Select
									labelId="page-size-label"
									value={pageSize()}
									label="На странице"
									onChange={(e) => {
										setPageSize(Number(e.target.value))
										setPage(1)
									}}
								>
									<MenuItemMUI value={10}>10</MenuItemMUI>
									<MenuItemMUI value={20}>20</MenuItemMUI>
									<MenuItemMUI value={50}>50</MenuItemMUI>
								</Select>
							</FormControl>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
								<Button
									variant="outlined"
									size="small"
									disabled={page() <= 1}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
								>
									Назад
								</Button>
								<Typography variant="body2" color="text.secondary">
									Страница {page()} из {totalPages()}
								</Typography>
								<Button
									variant="outlined"
									size="small"
									disabled={page() >= totalPages()}
									onClick={() => setPage((p) => Math.min(totalPages(), p + 1))}
								>
									Вперед
								</Button>
							</Box>
						</Box>
					</Show>
				</Grid>

				<CreateFolderDialog
					isOpened={isCreateFolderDialogOpen()}
					onCreate={createFolder}
					onClose={closeCreateFolderDialog}
				/>
				<input
					ref={uploadFileInputElement}
					type="file"
					multiple
					style="display: none"
					onChange={uploadFile}
				/>
				</Stack>
			</>
		)
	}

export default Files
