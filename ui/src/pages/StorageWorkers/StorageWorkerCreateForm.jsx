import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Select from '@suid/material/Select'
import InputLabel from '@suid/material/InputLabel'
import FormControl from '@suid/material/FormControl'
import FormHelperText from '@suid/material/FormHelperText'
import Typography from '@suid/material/Typography'
import Paper from '@suid/material/Paper'
import { createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import MenuItem from '@suid/material/MenuItem'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'

const StorageWorkerCreateForm = () => {
	/**
	 * @type {[import("solid-js").Accessor<import("../../api").StorageWorker[]>, any]}
	 */
	const [storages, setStorages] = createSignal([])
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const tokenHint = 'Токен создается в @BotFather и выглядит как 123456:ABC...'

	onMount(async () => {
		const storagesSchema = await API.storages.listStorages()
		setStorages(storagesSchema.storages)
	})

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()

		const data = new FormData(event.currentTarget)

		const name = data.get('name')
		const token = data.get('token')
		const storageId = data.get('storage_id')

		await API.storageWorkers.createStorageWorker(name, token, storageId)

		addAlert(`Бот "${name}" добавлен.`, 'success')

		navigate('/storage_workers')
	}

	return (
		<Stack sx={{ maxWidth: 540, minWidth: 320, mx: 'auto' }} spacing={2}>
			<Box>
				<Button
					onClick={() => navigate('/storage_workers')}
					variant="outlined"
					startIcon={<ChevronLeftIcon />}
				>
					Назад
				</Button>
			</Box>

			<Paper sx={{ p: 2.5 }}>
				<Stack spacing={1}>
					<Typography variant="h6">Подключение бота</Typography>
					<Typography variant="body2" color="text.secondary">
						Создайте бота в @BotFather, получите токен и добавьте бота в канал.
						Бот должен быть администратором, чтобы отправлять файлы.
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
				<Typography variant="h5">Добавить бота</Typography>
				<Divider />
				<TextField
					id="name"
					name="name"
					label="Название бота"
					variant="outlined"
					fullWidth
					required
				/>

				<TextField
					id="token"
					name="token"
					label="Токен бота"
					variant="outlined"
					helperText={tokenHint}
					fullWidth
					required
				/>

				<FormControl fullWidth variant="outlined" required>
					<InputLabel id="storage-select-label">Облако</InputLabel>
					<Select
						labelId="storage-select-label"
						label="Облако"
						name="storage_id"
					>
						{mapArray(storages, (storage) => (
							<MenuItem value={storage.id}>{storage.name}</MenuItem>
						))}
					</Select>
					<FormHelperText>
						Выберите облако, в которое бот будет отправлять файлы.
					</FormHelperText>
				</FormControl>

				<Button type="submit" variant="contained" color="secondary">
					Добавить бота
				</Button>
			</Box>
		</Stack>
	)
}

export default StorageWorkerCreateForm
