import { Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
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
import CheckCircleIcon from '@suid/icons-material/CheckCircleOutline'
import VisibilityIcon from '@suid/icons-material/Visibility'
import CompareIcon from '@suid/icons-material/CompareArrows'
import ExpandMoreIcon from '@suid/icons-material/ExpandMore'
import Fab from '@suid/material/Fab'
import NavigationIcon from '@suid/icons-material/Navigation'
import IconButton from '@suid/material/IconButton'
import InputAdornment from '@suid/material/InputAdornment'
import VisibilityOff from '@suid/icons-material/VisibilityOff'
import Skeleton from '@suid/material/Skeleton'
import Link from '@suid/material/Link'
import { useNavigate } from '@solidjs/router'
import { Cloud, Layers, Link2, Shield, MonitorSmartphone } from 'lucide-solid'

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
	const [passwordVisible, setPasswordVisible] = createSignal(false)
	const [capsLockOn, setCapsLockOn] = createSignal(false)
	const [isTelegramReady, setIsTelegramReady] = createSignal(false)
	const [faqOpen, setFaqOpen] = createSignal(0)
	const [comparisonTab, setComparisonTab] = createSignal('boost')
	const { addAlert } = alertStore
	const navigate = useNavigate()
	let telegramRoot
	const isRegister = () => mode() === 'register'
	let formRef

	const palette = () => ({
		bg: '#f4f6fb',
		card: '#ffffff',
		border: 'rgba(15,23,42,0.08)',
		text: '#0f172a',
		secondary: '#4b5565',
		accent: '#1b6ef3',
	})

	const heroBullets = [
		'Загружайте и храните файлы в Telegram - доступ с любого устройства.',
		'Управляйте несколькими облаками и ботами, делитесь файлами по ссылке.',
		'Добавляйте на экран как приложение (PWA) и работайте через удобное приложение.',
	]

	const featureCards = [
		{
			title: 'Файлы в Telegram',
			text: 'Хранение и доставка через Telegram-каналы/чаты.',
			icon: <Cloud color={palette().accent} size={22} strokeWidth={2.2} />,
		},
		{
			title: 'Мультиоблака',
			text: 'Подключайте несколько ботов и каналов под задачи.',
			icon: <Layers color={palette().accent} size={22} strokeWidth={2.2} />,
		},
		{
			title: 'Шаринг по ссылке',
			text: 'Включайте или выключайте доступ одной кнопкой.',
			icon: <Link2 color="#6366f1" size={22} strokeWidth={2.2} />,
		},
		{
			title: 'Приватность',
			text: 'Все файлы хранятся у вас в ТГ.',
			icon: <Shield color="#22c55e" size={22} strokeWidth={2.2} />,
		},
		{
			title: 'PWA как приложение',
			text: 'Устанавливается на телефон, работает офлайн-кешем UI.',
			icon: <MonitorSmartphone color="#f97316" size={22} strokeWidth={2.2} />,
		},
	]

	const steps = [
		{
			title: 'Войдите через Telegram',
			desc: 'Авторизация занимает несколько секунд.',
		},
		{
			title: 'Подключите токен бота',
			desc: 'Выберите канал/чат для хранения.',
		},
		{
			title: 'Загружайте и делитесь',
			desc: 'Включайте доступ по ссылке и храните файлы онлайн.',
		},
	]

	const comparison = [
		{
			id: 'classic',
			title: 'Классические диски',
			points: [
				'Приложения есть, но часто платные или с лимитами.',
				'Аккаунт/пароль, хранение на стороне провайдера.',
				'Скорость и лимиты зависят от тарифа.',
			],
		},
		{
			id: 'telegram',
			title: 'Telegram “Избранное”',
			points: [
				'Просто отправляете себе файлы.',
				'Поиск неудобен, нужно листать ленту.',
				'Нет структурных папок и расшаривания ссылкой.',
			],
		},
		{
			id: 'boost',
			title: 'BoostClicks Cloud',
			points: [
				'Бесплатно и безлимитно: хранение в вашем Telegram.',
				'Включайте/выключайте доступ по ссылке, приватность по умолчанию.',
				'Несколько ботов - быстрее загрузка и отдача.',
				'PWA: установка на главный экран, работает как приложение.',
			],
		},
	]

	const faqItems = [
		{
			q: 'Это безопасно?',
			a: 'Файлы лежат в вашем Telegram-канале. На сервере - только метаданные и токены в зашифрованном виде.',
		},
		{
			q: 'Где хранятся файлы?',
			a: 'В Telegram (канал/чат, который вы указали). Мы не храним сами файлы.',
		},
		{
			q: 'Что храните на сервере?',
			a: 'Только метаданные: названия, пути, ссылки доступа, привязка ботов. Контент - в Telegram.',
		},
		{
			q: 'Ограничения по размеру?',
			a: 'Используем чанки. Telegram ограничивает запросы и размер, большие файлы режутся и собираются.',
		},
		{
			q: 'Можно несколько ботов/каналов?',
			a: 'Да. Несколько ботов к одному облаку - быстрее загрузка/отдача.',
		},
		{
			q: 'Как работает доступ по ссылке?',
			a: 'Включаете или выключаете ссылку в один клик. При выключении доступ закрывается.',
		},
		{
			q: 'Подходит ли для команды вместо “Избранного”?',
			a: 'Да. Структура папок, быстрый поиск и шаринг ссылкой вместо прокрутки чата.',
		},
		{
			q: 'Чем отличается от Избранного?',
			a: 'Удобный поиск, папки, мультиботы, PWA и шаринг ссылкой. Не нужно листать ленту.',
		},
		{
			q: 'Работает на iPhone/Android как приложение?',
			a: 'Да, добавьте на главный экран (PWA). Интерфейс оптимизирован под mobile.',
		},
		{
			q: 'Что делать, если токен бота сменился?',
			a: 'Обновите токен в разделе ботов и переназначьте доступ, если нужно.',
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
				{ '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://cloud.boostclicks.ru/login' },
				{ '@type': 'ListItem', position: 2, name: 'Функции', item: 'https://cloud.boostclicks.ru/login#features' },
				{ '@type': 'ListItem', position: 3, name: 'FAQ', item: 'https://cloud.boostclicks.ru/login#faq' },
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

		document.title = 'Telegram-облако для файлов - BoostClicks Cloud | Альтернатива дискам'
		const desc = document.querySelector("meta[name='description']")
		if (desc) {
			desc.setAttribute(
				'content',
				'BoostClicks Cloud - облачное хранилище через Telegram: вход за секунды, мультиоблака, шаринг по ссылке и PWA. Удобная альтернатива дискам для файлов.'
			)
		}
		let canonical = document.querySelector("link[rel='canonical']")
		if (!canonical) {
			canonical = document.createElement('link')
			canonical.setAttribute('rel', 'canonical')
			document.head.appendChild(canonical)
		}
		canonical.setAttribute('href', 'https://cloud.boostclicks.ru/login')
		const robots = document.querySelector("meta[name='robots']")
		if (!robots) {
			const m = document.createElement('meta')
			m.setAttribute('name', 'robots')
			m.setAttribute('content', 'index,follow')
			document.head.appendChild(m)
		}

		injectSchema()
	})

	let widgetMounted = false
	const mountTelegramWidget = () => {
		if (widgetMounted || !telegramRoot) return
		const botName = import.meta.env.VITE_TELEGRAM_LOGIN_BOT_USERNAME
		if (!botName) {
			setTelegramError('Вход через Telegram пока не настроен.')
			setIsTelegramReady(true)
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
		script.onload = () => setIsTelegramReady(true)
		script.onerror = () => {
			setTelegramError('Telegram-виджет недоступен. Попробуйте позже.')
			setIsTelegramReady(true)
		}
		telegramRoot.appendChild(script)
		widgetMounted = true
	}

	createEffect(() => {
		if (store.access_token) return
		if (telegramRoot) {
			mountTelegramWidget()
		}
	})

	onCleanup(() => {
		delete window.onTelegramAuth
		telegramRoot?.replaceChildren()
	})

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

	const handleCaps = (event) => {
		setCapsLockOn(event.getModifierState('CapsLock'))
	}

	const navLinks = [
		{ label: 'Возможности', href: '#features' },
		{ label: 'Безопасность', href: '#security' },
		{ label: 'FAQ', href: '#faq' },
		{ label: 'Поддержка', href: 'https://t.me/boostclicks', external: true },
	]

	const scrollToForm = () => formRef?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	const scrollToTelegram = () => telegramRoot?.scrollIntoView({ behavior: 'smooth', block: 'center' })

	return (
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					backgroundColor: palette().bg,
					color: palette().text,
				}}
			>
			<Container
				maxWidth="lg"
				sx={{ py: { xs: 2.5, md: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}
			>
				<Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
					{navLinks.map((link) =>
						link.external ? (
							<Button
								component="a"
								href={link.href}
								target="_blank"
								rel="noopener"
								variant="text"
								color="inherit"
								sx={{ fontWeight: 600 }}
							>
								{link.label}
							</Button>
						) : (
							<Button
								component="a"
								href={link.href}
								variant="text"
								color="inherit"
								sx={{ fontWeight: 600 }}
							>
								{link.label}
							</Button>
						)
					)}
				</Stack>
			</Container>

			<Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flex: 1 }}>
				<Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
					<Grid item xs={12} md={7}>
						<Stack spacing={2}>
							<Typography
								variant="h1"
								sx={{ fontWeight: 800, color: '#f97316', fontSize: { xs: 32, md: '4.25rem' }, lineHeight: 1.05 }}
							>
								cloud.boostclicks
							</Typography>
							<Typography variant="h1" sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 800 }}>
								Облачное хранилище через Telegram - быстро, надежно и безопасно
							</Typography>
							<Typography variant="body1" sx={{ color: palette().secondary, maxWidth: 640 }}>
								Входите через Telegram, подключайте токены ботов и управляйте мультиоблаками с шарингом по ссылке и PWA-поддержкой.
							</Typography>
								<Stack spacing={1.2}>
									{heroBullets.map((text) => (
										<Stack direction="row" spacing={1} alignItems="center">
											<CheckCircleIcon color="primary" />
											<Typography variant="body2" sx={{ color: palette().secondary }}>
												{text}
											</Typography>
										</Stack>
									))}
								</Stack>
								<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
									<Chip label="PWA" variant="outlined" color="primary" />
									<Chip label="Все файлы в Telegram" variant="outlined" />
									<Chip label="Мультиоблака" variant="outlined" color="secondary" />
								</Stack>
							</Stack>
						</Grid>

					<Grid item xs={12} md={5}>
						<Paper
							sx={{
								p: { xs: 3, md: 3.5 },
								bgcolor: palette().card,
								border: `1px solid ${palette().border}`,
								boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
							}}
							elevation={0}
						>
							<Stack spacing={2}>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									Вход в приложение
								</Typography>
								<Typography variant="body2" sx={{ color: palette().secondary }}>
									Войдите через Telegram, чтобы продолжить.
								</Typography>

								<Box
									sx={{
										border: `1px dashed ${palette().border}`,
										borderRadius: 2,
										p: 2.5,
										minHeight: 120,
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										bgcolor: '#f8fafc',
									}}
								>
									<Box
										ref={(el) => {
											telegramRoot = el
											mountTelegramWidget()
										}}
										sx={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											width: '100%',
											'& > *': {
												margin: '0 auto',
											},
										}}
									/>
									<Show when={!isTelegramReady()}>
										<Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
											<Skeleton variant="rectangular" width="100%" height={48} />
											<Button
												variant="contained"
												color="primary"
												onClick={() => mountTelegramWidget()}
												sx={{ width: '100%' }}
											>
												Войти через Telegram
											</Button>
											<Typography variant="caption" sx={{ color: palette().secondary, textAlign: 'center' }}>
												Загружаем Telegram-виджет...
											</Typography>
										</Stack>
									</Show>
								</Box>
								{telegramError() ? <Alert severity="warning">{telegramError()}</Alert> : null}

								<Divider>или войдите по почте</Divider>
								<Box component="form" onSubmit={handleSubmit} ref={(el) => (formRef = el)}>
									<Stack spacing={2}>
										<TextField
											name="email"
											label="Электронная почта"
											type="email"
											required
											fullWidth
											onKeyUp={handleCaps}
											onKeyDown={handleCaps}
										/>
										<TextField
											name="password"
											label="Пароль"
											type={passwordVisible() ? 'text' : 'password'}
											required
											fullWidth
											onKeyUp={handleCaps}
											onKeyDown={handleCaps}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton
															onClick={() => setPasswordVisible((v) => !v)}
															aria-label="Показать пароль"
														>
															{passwordVisible() ? <VisibilityOff /> : <VisibilityIcon />}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
										<Show when={capsLockOn()}>
											<Typography variant="caption" color="error">
												Caps Lock включен
											</Typography>
										</Show>
										<Button type="submit" variant="contained" color="primary">
											{isRegister() ? 'Зарегистрироваться' : 'Войти'}
										</Button>
										<Link
											component="button"
											type="button"
											onClick={() => setMode(isRegister() ? 'login' : 'register')}
											underline="hover"
											sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
										>
											{isRegister() ? 'Уже есть аккаунт? Войти.' : 'Еще нет аккаунта? Зарегистрироваться.'}
										</Link>
									</Stack>
								</Box>

								<Typography variant="caption" sx={{ color: palette().secondary }}>
									Токены и данные: файлы лежат в Telegram, на сервере - только метаданные. Токен бота хранится зашифрованным и используется только для запросов к Telegram API.
								</Typography>
							</Stack>
						</Paper>
					</Grid>
				</Grid>
			</Container>

			<Box id="features" sx={{ backgroundColor: '#ffffff', py: { xs: 4, md: 6 } }}>
				<Container maxWidth="lg">
					<Stack spacing={3}>
						<Box>
							<Typography variant="h2" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800 }}>
								Почему Telegram-диск
							</Typography>
							<Typography variant="body1" sx={{ color: palette().secondary }}>
								Если вы привыкли к дискам вроде Яндекс.Диска или Google Drive - здесь тот же сценарий “файлы под рукой”, но с Telegram-инфраструктурой, приватностью и шарингом по ссылке.
							</Typography>
						</Box>
						<Box
							sx={{
								display: { xs: 'flex', sm: 'grid' },
								gridTemplateColumns: { sm: 'repeat(3, minmax(0, 1fr))' },
								gap: 1.5,
								overflowX: { xs: 'auto', sm: 'visible' },
								scrollSnapType: { xs: 'x mandatory', sm: 'none' },
								px: { xs: 1, sm: 0 },
							}}
						>
							{featureCards.map((card) => (
								<Paper
									elevation={0}
									sx={{
										p: 2,
										minWidth: { xs: 240, sm: 'auto' },
										scrollSnapAlign: { xs: 'start', sm: 'unset' },
										border: `1px solid ${palette().border}`,
										bgcolor: '#fff',
										boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
										display: 'flex',
										gap: 1.25,
										alignItems: 'flex-start',
										transition: 'transform 0.2s ease, box-shadow 0.2s ease',
										'&:hover': {
											transform: 'translateY(-2px)',
											boxShadow: '0 18px 40px rgba(15,23,42,0.14)',
										},
									}}
								>
									{card.icon}
									<Box>
										<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
											{card.title}
										</Typography>
										<Typography variant="body2" sx={{ color: palette().secondary }}>
											{card.text}
										</Typography>
									</Box>
								</Paper>
							))}
						</Box>
					</Stack>
				</Container>
			</Box>

			<Box id="how-it-works" sx={{ py: { xs: 4, md: 6 }, backgroundColor: palette().bg }}>
				<Container maxWidth="lg">
					<Grid container spacing={3} alignItems="stretch">
						<Grid item xs={12} md={7}>
							<Paper
								elevation={0}
								sx={{
									p: { xs: 3, md: 4 },
									border: `1px solid ${palette().border}`,
									bgcolor: '#fff',
								}}
							>
								<Typography variant="h2" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, mb: 2 }}>
									Как это работает
								</Typography>
								<Stack spacing={2}>
									{steps.map((step, idx) => (
										<Stack direction="row" spacing={1.5} alignItems="flex-start">
											<Chip
												label={`Шаг ${idx + 1}`}
												color="primary"
												variant="outlined"
												sx={{ minWidth: 80, justifyContent: 'center' }}
											/>
											<Box>
												<Typography variant="h6">{step.title}</Typography>
												<Typography variant="body2" sx={{ color: palette().secondary }}>
													{step.desc}
												</Typography>
											</Box>
										</Stack>
									))}
								</Stack>
							</Paper>
						</Grid>
						<Grid item xs={12} md={5}>
							<Paper
								id="security"
								elevation={0}
								sx={{
									p: { xs: 3, md: 4 },
									border: `1px solid ${palette().border}`,
									bgcolor: '#fff',
								}}
							>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
									Пример: мультиоблако
								</Typography>
								<Typography variant="body2" sx={{ color: palette().secondary, mb: 2 }}>
									Несколько ботов ускоряют загрузку и отдачу, шаринг по ссылке включается и выключается по кнопке.
								</Typography>
								<Stack spacing={1.2}>
									{['Маркетинг - приватно', 'Файлы команды - ссылка включена', 'Продажи - ссылка выключена'].map((item) => (
										<Paper
											elevation={0}
											sx={{
												p: 1.5,
												border: `1px solid ${palette().border}`,
												bgcolor: '#f8fafc',
											}}
										>
											<Stack direction="row" spacing={1} alignItems="center">
												<VisibilityIcon color="primary" />
												<Typography variant="body2">{item}</Typography>
											</Stack>
										</Paper>
									))}
								</Stack>
							</Paper>
						</Grid>
					</Grid>
				</Container>
			</Box>

			<Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#ffffff' }}>
				<Container maxWidth="lg">
					<Typography variant="h2" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, mb: 2 }}>
						Сравнение: классические диски и Telegram-диск
					</Typography>
					<Show when={typeof window !== 'undefined' && window.innerWidth < 960} fallback={
						<Grid container spacing={2}>
							{comparison.map((card) => (
								<Grid item xs={12} md={4}>
									<Paper
										elevation={0}
										sx={{
											p: 2.5,
											height: '100%',
											border: `1px solid ${palette().border}`,
											bgcolor: '#fff',
										}}
									>
										<Stack spacing={1}>
											<Stack direction="row" spacing={1} alignItems="center">
												<CompareIcon color="primary" />
												<Typography variant="h6">{card.title}</Typography>
											</Stack>
											{card.points.map((p) => (
												<Typography variant="body2" sx={{ color: palette().secondary }}>
													• {p}
												</Typography>
											))}
										</Stack>
									</Paper>
								</Grid>
							))}
						</Grid>
					}>
						<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
							{comparison.map((card) => (
								<Button
									variant={comparisonTab() === card.id ? 'contained' : 'text'}
									onClick={() => setComparisonTab(card.id)}
								>
									{card.title}
								</Button>
							))}
						</Stack>
						{comparison.map(
							(card) =>
								comparisonTab() === card.id && (
									<Paper
										elevation={0}
										sx={{
											p: 2,
											border: `1px solid ${palette().border}`,
											bgcolor: '#fff',
										}}
									>
										<Stack spacing={1}>
											<Stack direction="row" spacing={1} alignItems="center">
												<CompareIcon color="primary" />
												<Typography variant="h6">{card.title}</Typography>
											</Stack>
											{card.points.map((p) => (
												<Typography variant="body2" sx={{ color: palette().secondary }}>
													• {p}
												</Typography>
											))}
										</Stack>
									</Paper>
								)
						)}
					</Show>
				</Container>
			</Box>

			<Box id="faq" sx={{ py: { xs: 4, md: 6 }, backgroundColor: palette().bg }}>
				<Container maxWidth="lg">
					<Stack spacing={2.5}>
						<Typography variant="h2" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800 }}>
							FAQ
						</Typography>
						<Stack spacing={1}>
							{faqItems.map((item, idx) => {
								const opened = faqOpen() === idx
								return (
									<Paper
										elevation={0}
										onClick={() => setFaqOpen(opened ? -1 : idx)}
										sx={{
											p: 2,
											border: `1px solid ${palette().border}`,
											bgcolor: '#fff',
											cursor: 'pointer',
										}}
									>
										<Stack direction="row" justifyContent="space-between" alignItems="center">
											<Typography variant="h6">{item.q}</Typography>
											<ExpandMoreIcon
												htmlColor={palette().secondary}
												sx={{
													transition: 'transform 0.2s ease',
													transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
												}}
											/>
										</Stack>
										<Show when={opened}>
											<Typography variant="body2" sx={{ color: palette().secondary, mt: 1 }}>
												{item.a}
											</Typography>
										</Show>
									</Paper>
								)
							})}
						</Stack>
					</Stack>
				</Container>
			</Box>

			<Paper
				elevation={10}
				sx={{
					position: 'fixed',
					bottom: 12,
					left: 0,
					right: 0,
					mx: 'auto',
					width: 'min(960px, calc(100% - 24px))',
					display: { xs: 'flex', md: 'none' },
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 1,
					p: 1.5,
					borderRadius: 12,
					backdropFilter: 'blur(12px)',
				}}
			>
				<Stack spacing={0.5}>
					<Typography variant="body1" sx={{ fontWeight: 700 }}>
						Войти через Telegram
					</Typography>
					<Typography variant="caption" sx={{ color: palette().secondary }}>
						Основной способ входа.
					</Typography>
				</Stack>
				<Button variant="contained" color="secondary" onClick={scrollToTelegram}>
					Открыть
				</Button>
			</Paper>

			<Fab
				variant="extended"
				color="secondary"
				onClick={() => {
					setMode('register')
					scrollToForm()
				}}
				sx={{
					position: 'fixed',
					bottom: 24,
					right: 24,
					display: { xs: 'none', md: 'inline-flex' },
					boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
				}}
			>
				<NavigationIcon sx={{ mr: 1 }} />
				Создать облако
			</Fab>

			<Footer />
		</Box>
	)
}

export default Login
