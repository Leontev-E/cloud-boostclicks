import Typography from '@suid/material/Typography'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Paper from '@suid/material/Paper'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { convertSize } from '../../common/size_converter'

const Storages = () => {
	/**
	 * @type {[import("solid-js").Accessor<import("../../api").StorageWithInfo[]>, any]}
	 */
	const [storages, setStorages] = createSignal([])
	const navigate = useNavigate()

	onMount(async () => {
		const storagesSchema = await API.storages.listStorages()
		setStorages(storagesSchema.storages)
	})

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				spacing={2}
			>
				<Box>
					<Typography variant="h4">Облака</Typography>
					<Typography variant="body2" color="text.secondary">
						Каждое облако привязано к Telegram-каналу.
					</Typography>
				</Box>
				<Button
					onClick={() => navigate('/storages/register')}
					variant="contained"
					color="secondary"
				>
					Создать облако
				</Button>
			</Stack>

			<Paper sx={{ p: { xs: 2.5, md: 3 } }}>
				<Stack spacing={1}>
					<Typography variant="h6">Как подключить облако</Typography>
					<Typography variant="body2" color="text.secondary">
						1) Создайте Telegram-канал (рекомендуется создавать приватный
						канал).
					</Typography>
					<Typography variant="body2" color="text.secondary">
						2) Получите ID канала: добавьте @userinfobot или @getmyid_bot
						в канал и отправьте сообщение, либо перешлите сообщение из
						канала в бота. ID будет вида -1001234567890.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						3) Создайте облако, указав название и ID канала.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						4) Перейдите в раздел "Боты", добавьте токен и привяжите бота
						к облаку. Бота нужно назначить админом канала.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						5) Для более быстрой работы можно добавить несколько ботов в канал
						и привязать их к одному облаку.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						6) Готово - загружайте файлы.
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Поддерживаются как публичные, так и приватные каналы. К одному облаку
						рекомендуется привязывать несколько ботов для более быстрой работы.
					</Typography>
				</Stack>
			</Paper>

			<Show
				when={storages().length}
				fallback={
					<Paper sx={{ p: 4, textAlign: 'center' }}>
						<Typography variant="h6">Облака пока не созданы</Typography>
						<Typography variant="body2" color="text.secondary">
							Создайте первое облако и подключите Telegram-канал.
						</Typography>
					</Paper>
				}
			>
				<Grid container spacing={2}>
					{mapArray(storages, (storage) => (
						<Grid item xs={12} md={6} lg={4}>
							<Paper
								sx={{
									p: 3,
									cursor: 'pointer',
									transition: 'transform 0.2s ease',
									'&:hover': { transform: 'translateY(-4px)' },
								}}
								onClick={() => navigate(`/storages/${storage.id}/files`)}
							>
								<Stack spacing={1}>
									<Typography variant="h6">{storage.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										ID канала: {storage.chat_id}
									</Typography>
									<Stack direction="row" spacing={2}>
										<Typography variant="body2">
											Размер: {convertSize(storage.size)}
										</Typography>
										<Typography variant="body2">
											Файлов: {storage.files_amount}
										</Typography>
									</Stack>
								</Stack>
							</Paper>
						</Grid>
					))}
				</Grid>
			</Show>
		</Stack>
	)
}

export default Storages
