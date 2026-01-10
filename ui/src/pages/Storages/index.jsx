import Typography from '@suid/material/Typography'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Paper from '@suid/material/Paper'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import Chip from '@suid/material/Chip'
import Divider from '@suid/material/Divider'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { convertSize } from '../../common/size_converter'

const keywords = [
	'облако',
	'telegram диск',
	'бесплатное хранилище',
	'безлимитные файлы',
	'быстрый загрузчик',
	'мобильное облако',
]

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
			<Paper
				sx={{
					p: { xs: 3, md: 4 },
					background: 'linear-gradient(135deg, #2aabe2 0%, #1b6fd1 100%)',
					color: '#fff',
					border: 'none',
					boxShadow: '0 28px 60px rgba(27,26,23,0.18)',
				}}
			>
				<Grid container spacing={3} alignItems="center">
					<Grid item xs={12} md={8}>
						<Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
							Телеграм‑облако без лимитов
						</Typography>
						<Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
							Храните файлы в Telegram-канале и работайте как в привычном облаке:
							предпросмотр, быстрые ссылки, загрузка в один тап.
						</Typography>
						<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
							{keywords.map((k) => (
								<Chip
									label={k}
									variant="outlined"
									sx={{
										color: '#fff',
										borderColor: 'rgba(255,255,255,0.5)',
										background: 'rgba(255,255,255,0.08)',
									}}
								/>
							))}
						</Stack>
					</Grid>
					<Grid item xs={12} md={4}>
						<Stack spacing={1.2}>
							<Button
								onClick={() => navigate('/storages/register')}
								variant="contained"
								color="secondary"
								sx={{ color: '#1b1a17', fontWeight: 700 }}
							>
								Создать облако
							</Button>
							<Button
								onClick={() => navigate('/storage_workers')}
								variant="outlined"
								sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
							>
								Добавить бота
							</Button>
							<Typography variant="caption" sx={{ opacity: 0.85 }}>
								Крупные элементы для мобильных, предпросмотр без скачивания,
								приватность на базе вашего канала.
							</Typography>
						</Stack>
					</Grid>
				</Grid>
			</Paper>

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
				<Stack spacing={1.2}>
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
						6) Готово — загружайте файлы.
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Поддерживаются как публичные, так и приватные каналы. К одному облаку
						рекомендуется привязывать несколько ботов для более быстрой работы.
					</Typography>
				</Stack>

				<Divider sx={{ my: 2 }} />
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
					<Paper
						variant="outlined"
						sx={{ p: 2, flex: 1, backgroundColor: 'rgba(27,26,23,0.02)' }}
					>
						<Typography variant="subtitle1">Для мобильных</Typography>
						<Typography variant="body2" color="text.secondary">
							Облегчённый интерфейс, крупные кнопки, предпросмотр без скачивания.
						</Typography>
					</Paper>
					<Paper
						variant="outlined"
						sx={{ p: 2, flex: 1, backgroundColor: 'rgba(27,26,23,0.02)' }}
					>
						<Typography variant="subtitle1">Приватность</Typography>
						<Typography variant="body2" color="text.secondary">
							Все данные внутри вашего канала. Публичные ссылки — только по вашему запросу.
						</Typography>
					</Paper>
					<Paper
						variant="outlined"
						sx={{ p: 2, flex: 1, backgroundColor: 'rgba(27,26,23,0.02)' }}
					>
						<Typography variant="subtitle1">Безлимит</Typography>
						<Typography variant="body2" color="text.secondary">
							Telegram позволяет хранить большие файлы — мы даём удобный UI поверх.
						</Typography>
					</Paper>
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
