import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import { useNavigate, useParams } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import { onMount } from 'solid-js'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'
import { checkAuth } from '../../common/auth_guard'

const UploadFileTo = () => {
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const params = useParams()
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

		for (const file of files) {
			const fullPath = basePath ? `${basePath}/${file.name}` : file.name
			try {
				await API.files.uploadFileTo(params.id, fullPath, file)
				addAlert(`Файл "${file.name}" загружен`, 'success')
			} catch (err) {
				addAlert(
					`Не удалось загрузить "${file.name}". Попробуйте еще раз.`,
					'error'
				)
			}
		}

		navigateToFiles()
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
				<Button type="submit" variant="contained" color="secondary">
					Загрузить
				</Button>
			</Box>
		</Stack>
	)
}

export default UploadFileTo
