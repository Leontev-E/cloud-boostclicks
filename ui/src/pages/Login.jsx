import { Show, createSignal, onCleanup, onMount } from 'solid-js'
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
import List from '@suid/material/List'
import ListItem from '@suid/material/ListItem'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import SecurityIcon from '@suid/icons-material/Security'
import FlashOnIcon from '@suid/icons-material/FlashOn'
import LinkIcon from '@suid/icons-material/Link'
import MobileFriendlyIcon from '@suid/icons-material/MobileFriendly'
import VisibilityIcon from '@suid/icons-material/Visibility'
import ExpandMoreIcon from '@suid/icons-material/ExpandMore'
import CheckCircleIcon from '@suid/icons-material/CheckCircleOutline'
import { useNavigate } from '@solidjs/router'

import createLocalStore from '../../libs'
import API from '../api'
import Footer from '../components/Footer'
import { alertStore } from '../components/AlertStack'

const Login = (props) => {
	const [store, setStore] = createLocalStore()
	const [telegramError, setTelegramError] = createSignal()
	const [mode, setMode] = createSignal(
		props.initialMode === 'register' ? 'register' : 'login'
	)
	const [openFaqIndex, setOpenFaqIndex] = createSignal(0)
	const { addAlert } = alertStore
	const navigate = useNavigate()
	let telegramRoot
	const isRegister = () => mode() === 'register'
	let formRef

	const features = [
		{
			title: 'Вход через Telegram',
			text: 'Без паролей, мгновенный старт, проверка в один тап.',
			icon: <SecurityIcon color="primary" />,
		},
		{
			title: 'Мультиоблака и боты',
			text: 'Несколько облаков и ботов для ускорения загрузки/отдачи.',
			icon: <FlashOnIcon color="secondary" />,
		},
		{
			title: 'Предпросмотр без скачивания',
			text: 'Фото, видео, документы и папки открываются сразу в UI.',
			icon: <VisibilityIcon color="primary" />,
		},
		{
			title: 'Ссылки одним переключателем',
			text: 'Включайте и выключайте доступ по ссылке безопасно.',
			icon: <LinkIcon color="secondary" />,
		},
		{
			title: 'Mobile-first + PWA',
			text: 'Установите на экран смартфона, работайте как с приложением.',
			icon: <MobileFriendlyIcon color="primary" />,
		},
	]

	const steps = [
		{
			title: 'Войдите через Telegram',
			desc: 'Запуск без паролей. Авторизация через официальный виджет.',
		},
		{
			title: 'Создайте облако и добавьте бота',
			desc: 'Укажите ID канала, привяжите токены ботов, назначьте админом.',
		},
		{
			title: 'Загружайте и делитесь',
			desc: 'Предпросмотр, ссылки, скачивание папок архивом.',
		},
	]

	const faqItems = [
		{
			q: 'Что такое Telegram cloud storage?',
			a: 'Хранилище поверх вашего Telegram-канала: файлы остаются у вас, UI как у современного диска.',
		},
		{
			q: 'Как подключить облако?',
			a: 'Создайте канал, узнайте ID через @userinfobot, добавьте облако и назначьте бота админом.',
		},
		{
			q: 'Безопасно ли это?',
			a: 'Да. Доступ по ссылке включается и выключается переключателем, роли контролируете только вы.',
		},
		{
			q: 'Поддерживаются большие файлы?',
			a: 'Да. Чанковая загрузка, несколько ботов для скорости, скачивание папок архивом.',
		},
		{
			q: 'Нужен ли домен?',
			a: 'Домен нужен только для Telegram-логина. Канал можно оставить приватным.',
		},
	]

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
			mainEntity: faqItems.map((item) => ({
				'@type': 'Question',
				name: item.q,
				acceptedAnswer: { '@type': 'Answer', text: item.a },
			})),
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

	const scrollToForm = () => {
		formRef?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	const scrollToTelegram = () => {
		telegramRoot?.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: '#0b1020',
				backgroundImage:
					'radial-gradient(circle at 20% 20%, rgba(111,198,255,0.08), transparent 32%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 32%), linear-gradient(135deg, #0b1020 0%, #0a1328 55%, #07101f 100%)',
				color: '#e8edf6',
			}}
		>
			<Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flex: 1 }}>
				<Box
					sx={{
						'@keyframes fadeUp': {
							from: { opacity: 0, transform: 'translateY(12px)' },
							to: { opacity: 1, transform: 'translateY(0)' },
						},
					}}
				>
					<Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
						<Grid item xs={12} md={6}>
							<Stack spacing={2.5} sx={{ animation: 'fadeUp 0.6s ease forwards' }}>
								<Chip
									label="cloud.boostclicks — Telegram cloud"
									color="secondary"
									sx={{ width: 'fit-content', fontWeight: 700, letterSpacing: 0.2 }}
								/>
								<Typography
									variant="h1"
									sx={{
										fontSize: { xs: 30, md: 40 },
										lineHeight: 1.2,
										fontWeight: 800,
										color: '#f7fbff',
									}}
								>
									Ваше облако на базе Telegram. Быстро, безопасно, mobile-first.
								</Typography>
								<Typography variant="body1" sx={{ color: '#c0c9d9', maxWidth: 560 }}>
									Вход через Telegram, мультиоблака, предпросмотр без скачивания и PWA-режим. Управляйте файлами и ссылками в пару кликов.
								</Typography>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
									<Button
										variant="contained"
										color="secondary"
										size="large"
										onClick={() => {
											setMode('login')
											scrollToTelegram()
										}}
									>
										Начать с Telegram
									</Button>
									<Button
										variant="outlined"
										color="inherit"
										size="large"
										onClick={() => {
											setMode('register')
											scrollToForm()
										}}
									>
										Создать облако
									</Button>
								</Stack>
								<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
									<Chip label="PWA" variant="outlined" color="primary" />
									<Chip label="Мультиботы" variant="outlined" color="secondary" />
									<Chip label="Предпросмотр" variant="outlined" />
								</Stack>
							</Stack>
						</Grid>

						<Grid item xs={12} md={6}>
							<Card
								sx={{
									p: { xs: 2.5, md: 3 },
									bgcolor: 'rgba(255,255,255,0.04)',
									border: '1px solid rgba(255,255,255,0.08)',
									backdropFilter: 'blur(12px)',
									animation: 'fadeUp 0.7s ease forwards',
								}}
								elevation={0}
							>
								<CardContent>
									<Stack spacing={2.5}>
										<Typography variant="h5" sx={{ fontWeight: 700 }}>
											Почему Telegram-облако
										</Typography>
										<Box
											id="features"
											sx={{
												display: { xs: 'flex', sm: 'grid' },
												gridTemplateColumns: {
													sm: 'repeat( auto-fit, minmax(240px, 1fr) )',
													md: 'repeat(2, minmax(0, 1fr))',
												},
												gap: 1.5,
												overflowX: { xs: 'auto', sm: 'visible' },
												scrollSnapType: { xs: 'x mandatory', sm: 'none' },
												px: { xs: 1, sm: 0 },
											}}
										>
											{features.slice(0, 4).map((item) => (
												<Paper
													elevation={0}
													sx={{
														p: 2,
														minWidth: { xs: 240, sm: 'auto' },
														scrollSnapAlign: { xs: 'start', sm: 'unset' },
														bgcolor: 'rgba(255,255,255,0.06)',
														border: '1px solid rgba(255,255,255,0.08)',
														display: 'flex',
														alignItems: 'flex-start',
														gap: 1.25,
														transition: 'transform 0.2s ease, box-shadow 0.2s ease',
														'&:hover': {
															transform: 'translateY(-2px)',
															boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
														},
													}}
												>
													{item.icon}
													<Box>
														<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
															{item.title}
														</Typography>
														<Typography variant="body2" sx={{ color: '#c0c9d9' }}>
															{item.text}
														</Typography>
													</Box>
												</Paper>
											))}
										</Box>

										<Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

										<Stack spacing={1.2}>
											<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
												Как это работает — 3 шага
											</Typography>
											<List dense>
												{steps.map((step, index) => (
													<ListItem
														sx={{
															alignItems: 'flex-start',
															gap: 1,
															py: 1,
															'& .MuiListItemIcon-root': { minWidth: 28 },
														}}
													>
														<ListItemIcon>
															<CheckCircleIcon color="secondary" />
														</ListItemIcon>
														<ListItemText
															primary={
																<Typography sx={{ fontWeight: 700 }}>
																	{index + 1}. {step.title}
																</Typography>
															}
															secondary={
																<Typography variant="body2" sx={{ color: '#c0c9d9' }}>
																	{step.desc}
																</Typography>
															}
														/>
													</ListItem>
												))}
											</List>
										</Stack>
									</Stack>
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					<Grid
						container
						spacing={{ xs: 3, md: 4 }}
						sx={{ mt: { xs: 3, md: 5 }, alignItems: 'stretch' }}
					>
						<Grid item xs={12} md={6}>
							<Paper
								sx={{
									p: { xs: 3, md: 4 },
									bgcolor: 'rgba(255,255,255,0.06)',
									border: '1px solid rgba(255,255,255,0.08)',
									backdropFilter: 'blur(12px)',
									animation: 'fadeUp 0.75s ease forwards',
								}}
								elevation={0}
							>
								<Stack spacing={2}>
									<Stack spacing={0.5}>
										<Typography variant="h5" sx={{ fontWeight: 700 }}>
											{isRegister() ? 'Регистрация' : 'Вход в приложение'}
										</Typography>
										<Typography variant="body2" sx={{ color: '#c0c9d9' }}>
											{isRegister()
												? 'Создайте аккаунт или зайдите через Telegram.'
												: 'Войдите через Telegram, чтобы продолжить.'}
										</Typography>
									</Stack>
									<Box ref={(el) => (telegramRoot = el)} sx={{ minHeight: 54 }} />
									{telegramError() ? (
										<Alert severity="warning">{telegramError()}</Alert>
									) : null}
									<Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
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
												inputProps={{ 'aria-label': 'Электронная почта' }}
											/>
											<TextField
												name="password"
												label="Пароль"
												variant="outlined"
												type="password"
												required
												fullWidth
												inputProps={{ 'aria-label': 'Пароль' }}
											/>
											<Button
												type="submit"
												variant="contained"
												color="secondary"
												size="large"
												sx={{ py: 1.1 }}
											>
												{isRegister() ? 'Зарегистрироваться' : 'Войти'}
											</Button>
											<Button
												variant="text"
												color="inherit"
												sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
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

						<Grid item xs={12} md={6}>
							<Stack spacing={2.5}>
								<Card
									sx={{
										p: { xs: 2.5, md: 3 },
										bgcolor: 'rgba(255,255,255,0.05)',
										border: '1px solid rgba(255,255,255,0.08)',
										backdropFilter: 'blur(12px)',
										animation: 'fadeUp 0.8s ease forwards',
									}}
									elevation={0}
								>
									<CardContent>
										<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
											Преимущества
										</Typography>
										<Box
											sx={{
												display: 'grid',
												gridTemplateColumns: {
													xs: 'repeat(auto-fit, minmax(180px, 1fr))',
													md: 'repeat(2, minmax(0, 1fr))',
												},
												gap: 1.25,
											}}
										>
											{features.map((f) => (
												<Paper
													elevation={0}
													sx={{
														p: 1.5,
														bgcolor: 'rgba(255,255,255,0.06)',
														border: '1px solid rgba(255,255,255,0.08)',
														display: 'flex',
														gap: 1,
														alignItems: 'center',
													}}
												>
													{f.icon}
													<Box>
														<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
															{f.title}
														</Typography>
														<Typography variant="caption" sx={{ color: '#c0c9d9' }}>
															{f.text}
														</Typography>
													</Box>
												</Paper>
											))}
										</Box>
									</CardContent>
								</Card>

								<Card
									id="faq"
									sx={{
										p: { xs: 2.5, md: 3 },
										bgcolor: 'rgba(255,255,255,0.05)',
										border: '1px solid rgba(255,255,255,0.08)',
										backdropFilter: 'blur(12px)',
										animation: 'fadeUp 0.85s ease forwards',
									}}
									elevation={0}
								>
									<CardContent>
										<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
											FAQ
										</Typography>
										{faqItems.map((item, idx) => {
											const opened = openFaqIndex() === idx
											return (
												<Paper
													elevation={0}
													role="button"
													aria-expanded={opened}
													onClick={() =>
														setOpenFaqIndex(opened ? -1 : idx)
													}
													sx={{
														p: 1.5,
														mb: 1,
														bgcolor: 'transparent',
														border: '1px solid rgba(255,255,255,0.08)',
														cursor: 'pointer',
													}}
												>
													<Box
														sx={{
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'space-between',
															gap: 1,
														}}
													>
														<Typography sx={{ fontWeight: 700 }}>
															{item.q}
														</Typography>
														<ExpandMoreIcon
															htmlColor="#c0c9d9"
															sx={{
																transition: 'transform 0.2s ease',
																transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
															}}
														/>
													</Box>
													<Show when={opened}>
														<Typography
															variant="body2"
															sx={{ color: '#c0c9d9', mt: 1 }}
														>
															{item.a}
														</Typography>
													</Show>
												</Paper>
											)
										})}
									</CardContent>
								</Card>
							</Stack>
						</Grid>
					</Grid>
				</Box>
			</Container>

			<Paper
				elevation={8}
				sx={{
					position: 'fixed',
					bottom: 16,
					left: 0,
					right: 0,
					mx: 'auto',
					width: 'min(960px, calc(100% - 24px))',
					display: { xs: 'flex', md: 'none' },
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 1,
					p: 1.5,
					borderRadius: 99,
					backdropFilter: 'blur(12px)',
					bgcolor: 'rgba(13,18,36,0.92)',
					color: '#e8edf6',
				}}
			>
				<Stack spacing={0.5}>
					<Typography variant="body1" sx={{ fontWeight: 700 }}>
						Начните бесплатно
					</Typography>
					<Typography variant="caption" sx={{ color: '#c0c9d9' }}>
						Вход через Telegram или почту.
					</Typography>
				</Stack>
				<Stack direction="row" spacing={1}>
					<Button variant="contained" color="secondary" onClick={scrollToTelegram}>
						Telegram
					</Button>
					<Button
						variant="outlined"
						color="inherit"
						onClick={() => {
							setMode('register')
							scrollToForm()
						}}
					>
						Email
					</Button>
				</Stack>
			</Paper>

			<Footer />
		</Box>
	)
}

export default Login
