import Typography from '@suid/material/Typography'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Paper from '@suid/material/Paper'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'

const StorageWorkers = () => {
	/**
	 * @type {[import("solid-js").Accessor<import("../../api").StorageWorker[]>, any]}
	 */
	const [storageWorkers, setStorageWorkers] = createSignal([])
	const navigate = useNavigate()

	onMount(async () => {
		const storageWorkers = await API.storageWorkers.listStorageWorkers()
		setStorageWorkers(storageWorkers)
	})

	const maskToken = (token) => {
		if (!token || token.length < 10) {
			return token || 'токен не указан'
		}

		return `${token.slice(0, 6)}...${token.slice(-4)}`
	}

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				spacing={2}
			>
				<Box>
					<Typography variant="h4">Боты</Typography>
					<Typography variant="body2" color="text.secondary">
						Боты сохраняют файлы в ваши каналы и привязываются к облакам.
					</Typography>
				</Box>
				<Button
					onClick={() => navigate('/storage_workers/register')}
					variant="contained"
					color="secondary"
				>
					Добавить бота
				</Button>
			</Stack>

			<Paper sx={{ p: { xs: 2.5, md: 3 } }}>
				<Stack spacing={1}>
					<Typography variant="h6">Как подключить бота</Typography>
					<Typography variant="body2" color="text.secondary">
						1) Создайте бота в @BotFather и получите токен.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						2) Добавьте бота в канал и назначьте админом (отправка сообщений и
						файлов).
					</Typography>
					<Typography variant="body2" color="text.secondary">
						3) Привяжите бота к нужному облаку ниже.
					</Typography>
				</Stack>
			</Paper>

			<Show
				when={storageWorkers().length}
				fallback={
					<Paper sx={{ p: 4, textAlign: 'center' }}>
						<Typography variant="h6">Боты пока не добавлены</Typography>
						<Typography variant="body2" color="text.secondary">
							Создайте первого бота и привяжите его к облаку.
						</Typography>
					</Paper>
				}
			>
				<Grid container spacing={2}>
					{mapArray(storageWorkers, (sw) => (
						<Grid item xs={12} md={6} lg={4}>
							<Paper sx={{ p: 3 }}>
								<Stack spacing={1}>
									<Typography variant="h6">{sw.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										ID облака: {sw.storage_id || 'не привязан'}
									</Typography>
									<Typography variant="body2">
										Токен: {maskToken(sw.token)}
									</Typography>
								</Stack>
							</Paper>
						</Grid>
					))}
				</Grid>
			</Show>
		</Stack>
	)
}

export default StorageWorkers
