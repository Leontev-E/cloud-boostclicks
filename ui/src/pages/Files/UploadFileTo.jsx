import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import { useNavigate, useParams } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'

const UploadFileTo = () => {
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const params = useParams()

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

		const path = data.get('path')
		const file = data.get('file')

		await API.files.uploadFileTo(params.id, path, file)

		addAlert(`Файл загружен в "${path}"`, 'success')

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
				<Typography variant="h5">Загрузить файл в путь</Typography>

				<Divider />
				<TextField
					id="path"
					name="path"
					label="Путь"
					variant="outlined"
					fullWidth
					required
				/>
				<TextField
					id="file"
					name="file"
					label="Файл"
					type="file"
					variant="outlined"
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
