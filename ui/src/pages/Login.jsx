import { createSignal, onCleanup, onMount } from 'solid-js'
import Container from '@suid/material/Container'
import Box from '@suid/material/Box'
import TextField from '@suid/material/TextField'
import Button from '@suid/material/Button'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Alert from '@suid/material/Alert'
import Chip from '@suid/material/Chip'
import Card from '@suid/material/Card'
import CardContent from '@suid/material/CardContent'
import CardHeader from '@suid/material/CardHeader'
import List from '@suid/material/List'
import ListItem from '@suid/material/ListItem'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import CheckCircleIcon from '@suid/icons-material/CheckCircleOutline'
import CloudDoneIcon from '@suid/icons-material/CloudDone'
import SecurityIcon from '@suid/icons-material/Security'
import FlashOnIcon from '@suid/icons-material/FlashOn'
import LinkIcon from '@suid/icons-material/Link'
import MobileFriendlyIcon from '@suid/icons-material/MobileFriendly'
import createLocalStore from '../../libs'
import { useNavigate } from '@solidjs/router'

import API from '../api'
import Footer from '../components/Footer'
import { alertStore } from '../components/AlertStack'

const Login = (props) => {
	const [store, setStore] = createLocalStore()
	const [telegramError, setTelegramError] = createSignal()
	const [mode, setMode] = createSignal(
		props.initialMode === 'register' ? 'register' : 'login'
	)
	const { addAlert } = alertStore
	const navigate = useNavigate()
	let telegramRoot
	const isRegister = () => mode() === 'register'
	let formRef

	const handleTelegramAuth = async (user) => {
		try {
			const tokenData = await API.auth.telegramLogin(user)
			const identifier = user.username ? `@${user.username}` : `tg:${user.id}`

			const displayName = [user.first_name, user.last_name]
				.filter(Boolean)
				.join(' ')

			setStore('access_token', tokenData.access_token)
			setStore('user', { identifier, displayName })

			const redirect_url = store.redirect || '/'
			navigate(redirect_url)
		} catch (error) {
			addAlert('Не удалось войти через Telegram. Попробуйте еще раз.', 'error')
		}
	}

	const injectSchema = () => {
		const data = {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'cloud.boostclicks',
			url: 'https://cloud.boostclicks.ru',
			logo: 'https://cloud.boostclicks.ru/app-icon.svg',
			sameAs: ['https://github.com/Leontev-E/cloud-boostclicks'],
		}

		const website = {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'cloud.boostclicks',
			url: 'https://cloud.boostclicks.ru',
			potentialAction: {
				'@type': 'SearchAction',
				target: 'https://cloud.boostclicks.ru/login?q={search_term_string}',
				'query-input': 'required name=search_term_string',
			},
		}

		const faq = {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: [
				{
					'@type': 'Question',
					name: 'Что такое Telegram cloud storage?',
					acceptedAnswer: {
						'@type': 'Answer',
						text: 'Это облачное хранилище через Telegram-бота: файлы сохраняются в вашем канале, а интерфейс работает как привычный диск.',
					},
				},
				{
					'@type': 'Question',
					name: 'Как создать облако через Telegram?',
					acceptedAnswer: {
						'@type': 'Answer',
						text: 'Создайте канал, получите его ID, подключите облако в cloud.boostclicks и добавьте бота администратором.',
					},
				},
				{
					'@type': 'Question',
					name: 'Безопасно ли хранение файлов?',
					acceptedAnswer: {
						'@type': 'Answer',
						text: 'Да, данные остаются в вашем канале Telegram, ссылки можно включать и выключать, роли доступа управляются владельцем.',
					},
				},
				{
					'@type': 'Question',
					name: 'Можно ли работать с большими файлами?',
					acceptedAnswer: {
						'@type': 'Answer',
						text: 'Да, Telegram поддерживает крупные вложения, а интерфейс cloud.boostclicks позволяет загружать и скачивать большие файлы и папки.',
					},
				},
			],
		}

		const breadcrumb = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Главная',
					item: 'https://cloud.boostclicks.ru/login',
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: 'Функции',
					item: 'https://cloud.boostclicks.ru/login#features',
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: 'FAQ',
					item: 'https://cloud.boostclicks.ru/login#faq',
				},
			],
		}

		;[data, website, faq, breadcrumb].forEach((obj) => {
			const script = document.createElement('script')
			script.type = 'application/ld+json'
			script.textContent = JSON.stringify(obj)
			document.head.appendChild(script)
		})
	}

	onMount(() => {
		if (store.access_token) {
			navigate('/')
			return
		}

		document.title = 'Облачное хранилище через Telegram – cloud.boostclicks.ru'
		const desc = document.querySelector("meta[name='description']")
		if (desc) {
			desc.setAttribute(
				'content',
				'Telegram-облако для хранения файлов с мультиоблаками, ролями доступа и PWA-поддержкой. Безопасно, быстро и удобно.'
			)
		}
		injectSchema()

		const botName = import.meta.env.VITE_TELEGRAM_LOGIN_BOT_USERNAME
		if (!botName) {
			setTelegramError('Вход через Telegram пока не настроен.')
			return
		}

		if (!telegramRoot) {
			setTelegramError('Вход через Telegram недоступен в этом браузере.')
			return
		}

		window.onTelegramAuth = handleTelegramAuth

		const script = document.createElement('script')
		script.async = true
		script.src = 'https://telegram.org/js/telegram-widget.js?22'
		script.setAttribute('data-telegram-login', botName)
		script.setAttribute('data-size', 'large')
		script.setAttribute('data-radius', '12')
		script.setAttribute('data-request-access', 'write')
		script.setAttribute('data-onauth', 'onTelegramAuth(user)')
		script.setAttribute('data-userpic', 'false')
		telegramRoot.appendChild(script)

		onCleanup(() => {
			delete window.onTelegramAuth
			telegramRoot.replaceChildren()
		})
	})

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const email = data.get('email')
		const password = data.get('password')

		if (isRegister()) {
			await API.users.register(email, password)
			addAlert('Аккаунт создан.', 'success')
		}

		const tokenData = await API.auth.login(email, password)

		setStore('access_token', tokenData.access_token)
		setStore('user', { identifier: email })

		const redirect_url = store.redirect || '/'
		navigate(redirect_url)
	}

	const featureCards = [
		{
			title: 'Вход без паролей',
			text: 'Telegram Login + PWA: мгновенный вход, установка на главный экран, zero‑password опыт.',
			icon: <SecurityIcon color="secondary" />,
		},
		{
			title: 'Мультиоблака и боты',
			text: 'Несколько облаков, несколько ботов на одно облако для максимальной скорости загрузки/отдачи.',
			icon: <FlashOnIcon color="primary" />,
		},
		{
			title: 'Ссылки и предпросмотр',
			text: 'Фото, видео, документы и папки — предпросмотр и расшаривание одним переключателем.',
			icon: <LinkIcon color="secondary" />,
		},
		{
			title: 'Мобильный first',
			text: 'Крупные элементы, жесты, плавные переходы. Интерфейс оптимизирован под смартфоны 2026.',
			icon: <MobileFriendlyIcon color="primary" />,
		},
	]

	const steps = [
		'Войти через Telegram или по почте.',
		'Создать облако и указать ID канала.',
		'Добавить бота(ов) и назначить админом канала.',
		'Загрузить файлы, включить ссылки при необходимости.',
	]

	const highlights = [
		{
			title: 'Работает на базе вашего канала',
			text: 'Данные остаются у вас, доступы управляются через UI.',
			icon: <CloudDoneIcon color="secondary" />,
		},
		{
			title: 'Быстрые загрузки',
			text: 'Добавьте несколько ботов к одному облаку — параллельные потоки ускоряют загрузку.',
			icon: <FlashOnIcon color="primary" />,
		},
		{
			title: 'Предпросмотр без скачивания',
			text: 'Фото, видео, аудио, PDF — открываются прямо в интерфейсе.',
			icon: <LinkIcon color="secondary" />,
		},
	]

	const faqItems = [
		{
			q: 'Что такое Telegram cloud storage?',
			a: 'Облако поверх вашего Telegram‑канала. Файлы остаются в канале, интерфейс — как привычный диск.',
		},
		{
			q: 'Как подключить?',
			a: 'Создайте канал, возьмите ID через @userinfobot, создайте облако, добавьте бота админом.',
		},
		{
			q: 'Насколько это безопасно?',
			a: 'Доступ по ссылке выключается одним переключателем, данные в вашем канале, роли контролируете вы.',
		},
		{
			q: 'Поддерживаются большие файлы?',
			a: 'Да. Чанковая загрузка, несколько ботов для скорости, скачивание папок архивом.',
		},
	]

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: '#0c1117',
				backgroundImage:
					'radial-gradient(circle at 20% 20%, rgba(111,198,255,0.16), transparent 25%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 30%), linear-gradient(135deg, #0c1117 0%, #0b1420 50%, #0b111a 100%)',
				color: '#e7edf5',
			}}
		>
			<Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
				<Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
					<Grid item xs={12} md={6}>
						<Stack spacing={2.5}>
							<Chip
								label="cloud.boostclicks — Telegram cloud 2026"
								color="secondary"
								sx={{ width: 'fit-content', fontWeight: 700, letterSpacing: 0.2 }}
							/>
							<Typography
								variant="h1"
								sx={{
									maxWidth: 540,
									fontSize: { xs: 30, md: 42 },
									lineHeight: 1.2,
									fontWeight: 800,
								}}
							>
								Ваше облако на базе Telegram. Без паролей. С мобильным UX будущего.
							</Typography>
							<Typography variant="body1" sx={{ color: '#b6c4d6', maxWidth: 520 }}>
								Войдите через Telegram, привяжите ботов, управляйте облаками, ссылками и
								предпросмотром. Оптимизировано для смартфонов и PWA.
							</Typography>
							<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
								<Chip label="Telegram Login" variant="outlined" color="secondary" />
								<Chip label="PWA" variant="outlined" color="primary" />
								<Chip label="Мультиботы" variant="outlined" color="default" />
							</Stack>
						</Stack>
					</Grid>
					<Grid item xs={12} md={6}>
						<Paper
							sx={{
								p: { xs: 3, md: 4 },
								backdropFilter: 'blur(12px)',
								background:
									'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
								border: '1px solid rgba(255,255,255,0.08)',
								boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
								color: '#e7edf5',
							}}
							elevation={0}
						>
							<Stack spacing={2}>
								<Stack spacing={0.5}>
									<Typography variant="h5" sx={{ fontWeight: 700 }}>
										{isRegister() ? 'Регистрация' : 'Вход в приложение'}
									</Typography>
									<Typography variant="body2" sx={{ color: '#b6c4d6' }}>
										{isRegister()
											? 'Создайте аккаунт или зайдите через Telegram.'
											: 'Войдите через Telegram, чтобы продолжить.'}
									</Typography>
								</Stack>
								<Box ref={(el) => (telegramRoot = el)} sx={{ minHeight: 54 }} />
								{telegramError() ? (
									<Alert severity="warning">{telegramError()}</Alert>
								) : null}
								<Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
									{isRegister() ? 'или зарегистрируйтесь' : 'или войдите по почте'}
								</Divider>
								<Box component="form" onSubmit={handleSubmit} ref={(el) => (formRef = el)}>
									<Stack spacing={2}>
										<TextField
											name="email"
											label="Электронная почта"
											variant="outlined"
											type="email"
											required
											fullWidth
										/>
										<TextField
											name="password"
											label="Пароль"
											variant="outlined"
											type="password"
											required
											fullWidth
										/>
										<Button
											type="submit"
											variant="contained"
											color="secondary"
											size="large"
											sx={{ py: 1.2 }}
										>
											{isRegister() ? 'Зарегистрироваться' : 'Войти'}
										</Button>
										<Button
											variant="text"
											color="inherit"
											sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
											onClick={() => setMode(isRegister() ? 'login' : 'register')}
										>
											{isRegister()
												? 'Уже есть аккаунт? Войти.'
												: 'Еще нет аккаунта? Зарегистрироваться.'}
										</Button>
									</Stack>
								</Box>
							</Stack>
						</Paper>
					</Grid>
				</Grid>
			</Container>

			<Box sx={{ background: '#0b111a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
				<Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
					<Stack spacing={{ xs: 4, md: 6 }}>
						<Grid container spacing={3}>
							{featureCards.map((card) => (
								<Grid item xs={12} sm={6} md={3}>
									<Paper
										sx={{
											p: 2.5,
											height: '100%',
											bgcolor: 'rgba(255,255,255,0.03)',
											border: '1px solid rgba(255,255,255,0.06)',
										}}
										elevation={0}
									>
										<Stack spacing={1.2}>
											{card.icon}
											<Typography variant="h6">{card.title}</Typography>
											<Typography variant="body2" sx={{ color: '#b6c4d6' }}>
												{card.text}
											</Typography>
										</Stack>
									</Paper>
								</Grid>
							))}
						</Grid>

						<Box id="how-it-works">
							<Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>
								Как подключиться
							</Typography>
							<Grid container spacing={2}>
								{steps.map((text, idx) => (
									<Grid item xs={12} sm={6} md={3}>
										<Paper
											sx={{
												p: 2,
												height: '100%',
												bgcolor: 'rgba(255,255,255,0.03)',
												border: '1px solid rgba(255,255,255,0.05)',
											}}
											elevation={0}
										>
											<Stack spacing={1}>
												<Chip
													size="small"
													label={`Шаг ${idx + 1}`}
													color="secondary"
													sx={{ width: 'fit-content' }}
												/>
												<Typography variant="body1">{text}</Typography>
											</Stack>
										</Paper>
									</Grid>
								))}
							</Grid>
						</Box>

						<Box>
							<Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>
								Мобильный UX и производительность
							</Typography>
							<Grid container spacing={2}>
								{highlights.map((h) => (
									<Grid item xs={12} md={4}>
										<Paper
											sx={{
												p: 2.5,
												height: '100%',
												bgcolor: 'rgba(255,255,255,0.03)',
												border: '1px solid rgba(255,255,255,0.05)',
											}}
											elevation={0}
										>
											<Stack spacing={1}>
												{h.icon}
												<Typography variant="h6">{h.title}</Typography>
												<Typography variant="body2" sx={{ color: '#b6c4d6' }}>
													{h.text}
												</Typography>
											</Stack>
										</Paper>
									</Grid>
								))}
							</Grid>
						</Box>

						<Box id="faq">
							<Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>
								FAQ
							</Typography>
							<Stack spacing={1.2}>
								{faqItems.map((item) => (
									<Paper
										sx={{
											p: 2,
											bgcolor: 'rgba(255,255,255,0.03)',
											border: '1px solid rgba(255,255,255,0.05)',
										}}
										elevation={0}
									>
										<Typography variant="h6">{item.q}</Typography>
										<Typography variant="body2" sx={{ color: '#b6c4d6', mt: 0.5 }}>
											{item.a}
										</Typography>
									</Paper>
								))}
							</Stack>
						</Box>

						<Box id="cta">
							<Paper
								sx={{
									p: { xs: 3, md: 4 },
									textAlign: 'center',
									bgcolor: 'rgba(255,255,255,0.05)',
									border: '1px solid rgba(255,255,255,0.08)',
								}}
								elevation={0}
							>
								<Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
									Попробовать бесплатно
								</Typography>
								<Typography variant="body1" sx={{ color: '#b6c4d6', mb: 2 }}>
									Войдите через Telegram, добавьте ботов, подключите канал и начните загрузку
									файлов за минуты.
								</Typography>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									spacing={2}
									justifyContent="center"
									alignItems="center"
								>
									<Button
										variant="contained"
										color="secondary"
										onClick={() => setMode('login')}
										sx={{ minWidth: 200 }}
									>
										Начать с Telegram
									</Button>
									<Button
										variant="outlined"
										color="inherit"
										onClick={() => setMode('register')}
										sx={{ minWidth: 200 }}
									>
										Создать облако сейчас
									</Button>
								</Stack>
							</Paper>
						</Box>
					</Stack>
				</Container>
			</Box>
			<Footer />
		</Box>
	)
}

export default Login
