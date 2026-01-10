import { useNavigate } from '@solidjs/router'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import Chip from '@suid/material/Chip'
import Container from '@suid/material/Container'
import Grid from '@suid/material/Grid'
import Paper from '@suid/material/Paper'
import Stack from '@suid/material/Stack'
import Typography from '@suid/material/Typography'
import CssBaseline from '@suid/material/CssBaseline'

import AppIcon from '../components/AppIcon'
import Footer from '../components/Footer'
import InstallPromptBanner from '../components/InstallPromptBanner'

const keywords = [
	'телеграм облако',
	'telegram диск',
	'облако без лимитов',
	'приватное хранилище',
	'быстрые загрузки',
	'мобильное облако',
	'файлы по ссылке',
	'бесплатный диск',
	'pwa cloud',
]

const featureCards = [
	{
		title: 'Приватность по умолчанию',
		desc: 'Файлы остаются в вашем Telegram-канале. Публичные ссылки — только по переключателю.',
	},
	{
		title: 'Предпросмотр без скачивания',
		desc: 'Фото, видео, документы, аудио и тексты открываются сразу в интерфейсе.',
	},
	{
		title: 'Работает на телефоне',
		desc: 'Крупные элементы, быстрые действия, PWA — установите на главный экран.',
	},
	{
		title: 'Несколько ботов',
		desc: 'Привяжите несколько ботов к одному облаку, чтобы ускорить загрузку и отдачу.',
	},
	{
		title: 'Ссылки на файлы и папки',
		desc: 'Включайте и выключайте доступ по ссылке одним переключателем.',
	},
]

const Home = () => {
	const navigate = useNavigate()

	return (
		<Box
			sx={{
				backgroundColor: '#f7f1e8',
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<CssBaseline />
			<Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flex: 1 }}>
				<Paper
					sx={{
						p: { xs: 3, md: 5 },
						border: 'none',
						color: '#fff',
						background:
							'radial-gradient(120% 120% at 20% 20%, rgba(246,160,77,0.35), transparent 50%), linear-gradient(135deg, #2aabe2 0%, #1b6fd1 50%, #2c5f5d 100%)',
						boxShadow: '0 28px 60px rgba(27,26,23,0.18)',
					}}
				>
					<Grid container spacing={3} alignItems="center">
						<Grid item xs={12} md={7}>
							<Stack spacing={2}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<AppIcon size={36} />
									<Typography variant="h4" sx={{ fontWeight: 700 }}>
										cloud.boostclicks — Telegram-диск
									</Typography>
								</Box>
								<Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 640 }}>
									Современное облако поверх вашего Telegram-канала: загрузка
									файлов, предпросмотр без скачивания, доступ по ссылке и
									полная приватность. Оптимизировано для смартфонов.
								</Typography>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
									<Button
										variant="contained"
										color="secondary"
										onClick={() => navigate('/login')}
										sx={{ color: '#1b1a17', fontWeight: 700 }}
									>
										Войти через Telegram
									</Button>
									<Button
										variant="outlined"
										onClick={() => navigate('/storages')}
										sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
									>
										К облакам
									</Button>
								</Stack>
								<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
									{keywords.map((kw) => (
										<Chip
											label={kw}
											variant="outlined"
											sx={{
												color: '#fff',
												borderColor: 'rgba(255,255,255,0.5)',
												background: 'rgba(255,255,255,0.08)',
											}}
										/>
									))}
								</Stack>
							</Stack>
						</Grid>
						<Grid item xs={12} md={5}>
							<Paper
								variant="outlined"
								sx={{
									p: 3,
									backgroundColor: 'rgba(255,255,255,0.08)',
									borderColor: 'rgba(255,255,255,0.25)',
								}}
							>
								<Stack spacing={1.5}>
									<Typography variant="subtitle1" sx={{ color: '#fff' }}>
										Шаги подключения
									</Typography>
									<Typography sx={{ color: 'rgba(255,255,255,0.86)' }}>
										1) Создайте Telegram-канал (рекомендуется приватный).
									</Typography>
									<Typography sx={{ color: 'rgba(255,255,255,0.86)' }}>
										2) Узнайте ID: добавьте @userinfobot или @getmyid_bot в канал
										и получите ID вида -1001234567890.
									</Typography>
									<Typography sx={{ color: 'rgba(255,255,255,0.86)' }}>
										3) Подключите облако и добавьте бота администратором канала.
									</Typography>
									<Typography sx={{ color: 'rgba(255,255,255,0.86)' }}>
										4) Прикрепите несколько ботов к одному облаку — так загрузки
										и отдача будут быстрее.
									</Typography>
								</Stack>
							</Paper>
						</Grid>
					</Grid>
				</Paper>

				<Stack spacing={3} sx={{ mt: 4 }}>
					<Typography variant="h5">Почему cloud.boostclicks</Typography>
					<Grid container spacing={2}>
						{featureCards.map((feature) => (
							<Grid item xs={12} sm={6} md={4}>
								<Paper sx={{ p: 2.5, height: '100%' }}>
									<Stack spacing={1}>
										<Typography variant="subtitle1">{feature.title}</Typography>
										<Typography variant="body2" color="text.secondary">
											{feature.desc}
										</Typography>
									</Stack>
								</Paper>
							</Grid>
						))}
					</Grid>

					<Paper sx={{ p: { xs: 2.5, md: 3 } }}>
						<Stack spacing={1.5}>
							<Typography variant="h6">SEO и преимущества</Typography>
							<Typography variant="body2" color="text.secondary">
								Cloud.boostclicks — облако, которое работает поверх Telegram:
								быстрый диск, гибкое хранилище, предпросмотр медиа и документов,
								возможность делиться файлами и папками по ссылке. Поддерживаются
								публичные и приватные каналы, а домен нужен только для входа через
								Telegram-логин.
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Ключевые запросы: облако, telegram облако, приватное облако,
								бесплатный диск, облачное хранилище, загрузка файлов, ссылки на
								файлы, предпросмотр, мобильный PWA-диск, установка на рабочий
								стол.
							</Typography>
						</Stack>
					</Paper>
				</Stack>
			</Container>
			<Footer />
			<InstallPromptBanner />
		</Box>
	)
}

export default Home
