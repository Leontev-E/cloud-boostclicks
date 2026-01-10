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
import createLocalStore from '../../../libs'

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
		let uploaded = 0
		try {
			for (const file of files) {
				const fullPath = basePath ? `${basePath}/${file.name}` : file.name
				const chunkSize = 8 * 1024 * 1024
				let offset = 0
				const totalChunks = Math.ceil(file.size / chunkSize)
				let fileId

				while (offset < file.size) {
					const chunk = file.slice(offset, offset + chunkSize)
					const chunkIndex = Math.floor(offset / chunkSize)
					let prevLoaded = 0
					try {
						const res = await uploadWithProgress(
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
								setUploadProgress(
									Math.min(
										100,
										Math.round(
											((uploaded + offset + loaded) / totalSize) * 100
										)
									)
								)
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
			}
			navigateToFiles()
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
		}
	}

	const uploadWithProgress = (
		storageId,
		fullPath,
		chunk,
		chunkIndex,
		totalChunks,
		fileId,
		totalSize,
		onProgress
	) =>
		new Promise((resolve, reject) => {
			const form = new FormData()
			form.append('chunk', chunk)
			form.append('path', fullPath)
			form.append('chunk_index', String(chunkIndex))
			form.append('total_chunks', String(totalChunks))
			if (fileId) form.append('file_id', fileId)
			if (chunkIndex === 0) form.append('size', String(totalSize || chunk.size || 0))

			const [store] = createLocalStore()
			const apiBase = import.meta.env.VITE_API_BASE || '/api'
			const xhr = new XMLHttpRequest()
			xhr.open('POST', `${apiBase}/storages/${storageId}/files/upload_chunked`)
			xhr.setRequestHeader('Authorization', `Bearer ${store.access_token}`)
			xhr.timeout = 0
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable && typeof onProgress === 'function') {
					onProgress(e.loaded)
				}
			}
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve()
				} else {
					reject(new Error(xhr.responseText || 'upload failed'))
				}
			}
			xhr.onerror = () => reject(new Error('upload failed'))
			xhr.ontimeout = () => reject(new Error('upload timeout'))
			xhr.send(form)
		})

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
