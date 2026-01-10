import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import { useNavigate, useParams } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import { createSignal, onMount } from 'solid-js'
import LinearProgress from '@suid/material/LinearProgress'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'
import { checkAuth } from '../../common/auth_guard'

const UploadFileTo = () => {
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const params = useParams()
	const [isUploading, setIsUploading] = createSignal(false)
	const [uploadProgress, setUploadProgress] = createSignal(0)
	onMount(checkAuth)

	const navigateToFiles = () => {
		navigate(`/storages/${params.id}/files`)
	}

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()

		const data = new FormData(event.currentTarget)

		const rawPath = (data.get('path') || '').toString().trim()
		const basePath = rawPath.replace(/\/+$/, '')
		const files = data.getAll('file').filter((file) => file instanceof File)

		if (!files.length) {
			addAlert('Выберите хотя бы один файл.', 'warning')
			return
		}

		setIsUploading(true)
		setUploadProgress(0)
		const totalSize = files.reduce((sum, f) => sum + f.size, 0) || 1
		const chunkSize = 20 * 1024 * 1024
		let uploaded = 0
		try {
			for (const file of files) {
				const fullPath = basePath ? `${basePath}/${file.name}` : file.name
				let offset = 0
				const totalChunks = Math.ceil(file.size / chunkSize)
				let fileId

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
							fullPath,
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
			}
			navigateToFiles()
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
		}
	}

	return (
		<Stack sx={{ maxWidth: 540, minWidth: 320, mx: 'auto' }}>
			<Box>
				<Button
					onClick={navigateToFiles}
					variant="outlined"
					startIcon={<ChevronLeftIcon />}
				>
					Назад
				</Button>
			</Box>

			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
					py: 2,
					mx: 'auto',
					maxWidth: 400,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					'& > :not(style)': { my: 1.5 },
				}}
			>
				<Typography variant="h5">Загрузка по пути</Typography>
				{isUploading() ? <LinearProgress sx={{ width: '100%' }} /> : null}

				<Divider />
				<TextField
					id="path"
					name="path"
					label="Путь к папке"
					variant="outlined"
					helperText="Оставьте пустым для корня или укажите папку, например: документы/"
					fullWidth
				/>
				<TextField
					id="file"
					name="file"
					label="Файлы"
					type="file"
					variant="outlined"
					inputProps={{ multiple: true }}
					fullWidth
					required
				/>
				{isUploading() ? (
					<LinearProgress
						variant="determinate"
						value={uploadProgress()}
						sx={{ width: '100%' }}
					/>
				) : null}
				<Button type="submit" variant="contained" color="secondary">
					Загрузить
				</Button>
			</Box>
		</Stack>
	)
}

export default UploadFileTo
