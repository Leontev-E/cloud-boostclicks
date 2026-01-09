import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import Paper from '@suid/material/Paper'
import { createSignal } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'

const StorageCreateForm = () => {
	const [chatIdErr, setChatIdErr] = createSignal(null)
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const chatIdHint =
		'Как получить ID: добавьте @userinfobot или @getmyid_bot в канал и отправьте сообщение, либо перешлите сообщение из канала боту. ID будет вида -1001234567890.'

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()

		const data = new FormData(event.currentTarget)

		const name = data.get('name')
		const chatIdValue = data.get('chat_id')
		const chatId = Number(chatIdValue)

		if (!name || Number.isNaN(chatId)) {
			addAlert('Укажите корректные данные облака.', 'error')
			return
		}

		await API.storages.createStorage(name, chatId)

		addAlert(`Облако "${name}" создано.`, 'success')

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
		const numberValue = Number(value)

		if (value === '') {
			err = 'ID канала обязателен.'
		} else if (Number.isNaN(numberValue)) {
			err = 'ID канала должен быть числом.'
		} else if (numberValue > 0) {
			err = 'ID канала должен быть отрицательным и обычно начинается с -100.'
		}

		setChatIdErr(err)
	}

	return (
		<Stack sx={{ maxWidth: 540, minWidth: 320, mx: 'auto' }} spacing={2}>
			<Box>
				<Button
					onClick={() => navigate('/storages')}
					variant="outlined"
					startIcon={<ChevronLeftIcon />}
				>
					Назад
				</Button>
			</Box>

			<Paper sx={{ p: 2.5 }}>
				<Stack spacing={1}>
					<Typography variant="h6">Подключение облака</Typography>
					<Typography variant="body2" color="text.secondary">
						Можно использовать приватный канал. Домен для канала не нужен — он
						требуется только для Telegram-логина.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						После создания облака перейдите в раздел «Боты» и добавьте бота с
						токеном. Боту нужны права администратора канала.
					</Typography>
				</Stack>
			</Paper>

			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
					py: 2,
					mx: 'auto',
					maxWidth: 420,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					'& > :not(style)': { my: 1.5 },
				}}
			>
				<Typography variant="h5">Создать облако</Typography>
				<Divider />
				<TextField
					id="name"
					name="name"
					label="Название облака"
					variant="outlined"
					helperText="Например: Основное облако"
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
					helperText={chatIdErr() || chatIdHint}
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
