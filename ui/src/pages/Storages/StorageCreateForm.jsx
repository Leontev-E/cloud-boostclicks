import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import { createSignal } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import IconButton from '@suid/material/IconButton'
import HelpOutlineIcon from '@suid/icons-material/HelpOutline'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'

const StorageCreateForm = () => {
	const [chatIdErr, setChatIdErr] = createSignal(null)
	const { addAlert } = alertStore
	const navigate = useNavigate()

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()

		const data = new FormData(event.currentTarget)

		const name = data.get('name')
		const chatId = parseInt(data.get('chat_id'))

		await API.storages.createStorage(name, chatId)

		addAlert(`Облако "${name}" создано`, 'success')

		navigate('/storages')
	}

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const validateChatId = (event) => {
		event.preventDefault()
		const value = event.currentTarget.value

		let err = null

		if (value > 0) {
			err = 'ID канала должен быть отрицательным числом'
		} else if (value === '') {
			err = 'ID канала обязателен и должен быть отрицательным числом'
		}

		setChatIdErr(err)
	}

	return (
		<Stack sx={{ maxWidth: 540, minWidth: 320, mx: 'auto' }}>
			<Box>
				<Button
					onClick={() => navigate('/storages')}
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
				<Typography variant="h5">
					Создать облако
					<a
						href="https://boostclicks.ru"
						target="_blank"
					>
						<IconButton color="warning" sx={{ py: 0 }}>
							<HelpOutlineIcon />
						</IconButton>
					</a>
				</Typography>
				<Divider />
				<TextField
					id="name"
					name="name"
					label="Название облака"
					variant="outlined"
					fullWidth
					required
				/>
				<TextField
					id="chat_id"
					name="chat_id"
					label="ID Telegram-канала"
					type="number"
					variant="outlined"
					onChange={validateChatId}
					helperText={chatIdErr}
					error={typeof chatIdErr() === 'string'}
					fullWidth
					required
				/>
				<Button type="submit" variant="contained" color="secondary">
					Создать облако
				</Button>
			</Box>
		</Stack>
	)
}

export default StorageCreateForm
