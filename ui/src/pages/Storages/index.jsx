import Typography from '@suid/material/Typography'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Paper from '@suid/material/Paper'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import Skeleton from '@suid/material/Skeleton'

import API from '../../api'
import { convertSize } from '../../common/size_converter'
import { checkAuth } from '../../common/auth_guard'

const Storages = () => {
	/**
	 * @type {[import("solid-js").Accessor<import("../../api").StorageWithInfo[]>, any]}
	 */
	const [storages, setStorages] = createSignal([])
	const [isLoading, setIsLoading] = createSignal(true)
	const navigate = useNavigate()

	onMount(async () => {
		checkAuth()
		const storagesSchema = await API.storages.listStorages()
		setStorages(storagesSchema.storages)
		setIsLoading(false)
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
						Каждое облако привязано к вашему Telegram-каналу.
					</Typography>
				</Box>
				<Stack direction="row" spacing={1.5}>
					<Button
						onClick={() => navigate('/storages/register')}
						variant="contained"
						color="secondary"
					>
						Создать облако
					</Button>
					<Button
						onClick={() => navigate('/storage_workers')}
						variant="outlined"
						color="primary"
					>
						Боты
					</Button>
				</Stack>
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
						к облаку.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						5) Назначьте бота администратором канала (отправка сообщений и файлов)
						и, при необходимости, добавьте несколько ботов к одному облаку для
						быстрой работы.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						6) Готово — загружайте файлы.
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Поддерживаются как публичные, так и приватные каналы. К одному облаку
						рекомендуется привязывать несколько ботов для более быстрой работы.
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Домен нужен только для Telegram-логина; в канал домен добавлять не нужно.
					</Typography>
				</Stack>
			</Paper>

			<Show when={!isLoading() && storages().length}>
				<Grid container spacing={2}>
					{mapArray(storages, (storage) => (
						<Grid item xs={12} md={6} lg={4}>
							<Paper
								sx={{
									p: 3,
									height: '100%',
									cursor: 'pointer',
									transition: 'transform 0.2s ease, box-shadow 0.2s ease',
									'&:hover': {
										transform: 'translateY(-4px)',
										boxShadow: '0 16px 32px rgba(15,23,42,0.12)',
									},
								}}
								onClick={() => navigate(`/storages/${storage.id}/files`)}
							>
								<Stack spacing={1}>
									<Typography variant="h6">{storage.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										ID канала: {storage.chat_id}
									</Typography>
									<Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
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
			<Show when={isLoading()}>
				<Grid container spacing={2}>
					{Array.from({ length: 3 }).map(() => (
						<Grid item xs={12} md={6} lg={4}>
							<Paper sx={{ p: 3 }}>
								<Skeleton variant="text" width="60%" />
								<Skeleton variant="text" width="40%" />
								<Skeleton variant="rectangular" height={12} sx={{ mt: 1 }} />
							</Paper>
						</Grid>
					))}
				</Grid>
			</Show>
			<Show when={!isLoading() && !storages().length}>
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<Typography variant="h6">Облака пока не созданы</Typography>
					<Typography variant="body2" color="text.secondary">
						Создайте первое облако и подключите Telegram-канал.
					</Typography>
				</Paper>
			</Show>
		</Stack>
	)
}

export default Storages
