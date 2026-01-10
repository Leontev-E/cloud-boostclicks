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
import Link from '@suid/material/Link'
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
import ExpandMoreIcon from '@suid/icons-material/ExpandMore'
import Fab from '@suid/material/Fab'
import NavigationIcon from '@suid/icons-material/Navigation'
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

		return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Container
				maxWidth="lg"
				sx={{ py: { xs: 6, md: 10 }, flex: 1 }}
			>
				<Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
					<Grid item xs={12} md={6}>
						<Stack spacing={2}>
							<Chip
								label="cloud.boostclicks"
								color="secondary"
								sx={{ width: 'fit-content', fontWeight: 600 }}
							/>
							<Typography variant="h1" sx={{ maxWidth: 520, fontSize: { xs: 30, md: 40 } }}>
								Облачное хранилище через Telegram – быстро, надежно и безопасно
							</Typography>
							<Typography variant="body1" color="text.secondary">
								Входите через Telegram, подключайте токены ботов и управляйте
								мультиоблаками с ролями доступа и PWA‑поддержкой.
							</Typography>
						</Stack>
					</Grid>
					<Grid item xs={12} md={6}>
						<Paper sx={{ p: { xs: 3, md: 4 } }} elevation={6}>
							<Stack spacing={2}>
								<Typography variant="h5">
									{isRegister() ? 'Регистрация' : 'Вход в приложение'}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{isRegister()
										? 'Создайте аккаунт или войдите через Telegram.'
										: 'Войдите через Telegram, чтобы продолжить.'}
								</Typography>
								<Box ref={(el) => (telegramRoot = el)} sx={{ minHeight: 54 }} />
								{telegramError() ? (
									<Alert severity="warning">{telegramError()}</Alert>
								) : null}
								<Divider>
									{isRegister() ? 'или зарегистрируйтесь' : 'или войдите по почте'}
								</Divider>
								<Box component="form" onSubmit={handleSubmit}>
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
										<Button type="submit" variant="contained" color="primary">
											{isRegister() ? 'Зарегистрироваться' : 'Войти'}
										</Button>
									</Stack>
								</Box>
								<Link
									component="button"
									type="button"
									onClick={() =>
										setMode(isRegister() ? 'login' : 'register')
									}
									underline="hover"
									sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
								>
									{isRegister()
										? 'Уже есть аккаунт? Войти.'
										: 'Еще нет аккаунта? Зарегистрироваться.'}
								</Link>
							</Stack>
						</Paper>
					</Grid>
				</Grid>
			</Container>
			<Box sx={{ backgroundColor: '#f7f1e8' }}>
				<Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
					<Stack spacing={4}>
						<Box id="features">
							<Typography variant="h2" sx={{ mb: 2 }}>
								Почему именно Telegram-облако
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={12} md={7}>
									<Paper sx={{ p: { xs: 3, md: 4 } }}>
										<Stack spacing={1.5}>
											<Typography variant="h3">
												Вход через Telegram — без паролей
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Авторизация через виджет Telegram. Пароли не нужны, данные остаются в вашем канале.
											</Typography>
											<Typography variant="h3">
												Мультиоблака и роли доступа
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Несколько облаков на одном аккаунте, привязка ботов и ролей, удобный UI для команды.
											</Typography>
											<List dense>
												{[
													{
														icon: <SecurityIcon color="primary" />,
														text: 'Приватность: файлы в вашем Telegram-канале.',
													},
													{
														icon: <FlashOnIcon color="secondary" />,
														text: 'Скорость: несколько ботов = быстрые загрузки.',
													},
													{
														icon: <LinkIcon color="primary" />,
														text: 'Ссылки: включение/отключение доступа одним переключателем.',
													},
													{
														icon: <MobileFriendlyIcon color="secondary" />,
														text: 'PWA и мобильный UI: крупные элементы, предпросмотр без скачивания.',
													},
												].map((item) => (
													<ListItem>
														<ListItemIcon>{item.icon}</ListItemIcon>
														<ListItemText primary={item.text} />
													</ListItem>
												))}
											</List>
											<Typography variant="body2" color="text.secondary">
												Ключевые запросы: облачное хранилище Telegram, облако на базе Telegram, Telegram cloud storage, cloud storage Telegram, PWA Telegram облако.
											</Typography>
										</Stack>
									</Paper>
								</Grid>
								<Grid item xs={12} md={5}>
									<Stack spacing={2}>
										<Card>
											<CardHeader
												title="Как подключить"
												subheader="4 шага и всё готово"
											/>
											<CardContent>
												<List dense>
													{[
														'Создайте Telegram‑канал (лучше приватный).',
														'Узнайте ID: @userinfobot или @getmyid_bot (ID вида -100...).',
														'Подключите облако, добавьте бота и назначьте его админом канала.',
														'Прикрепите несколько ботов для максимальной скорости.',
													].map((text) => (
														<ListItem>
															<ListItemIcon>
																<CheckCircleIcon color="primary" />
															</ListItemIcon>
															<ListItemText primary={text} />
														</ListItem>
													))}
												</List>
											</CardContent>
										</Card>
										<Card id="features-list">
											<CardHeader
												avatar={<CloudDoneIcon color="secondary" />}
												title="Основные функции cloud.boostclicks.ru"
												subheader="PWA, предпросмотр, ссылки"
											/>
											<CardContent>
												<Typography variant="h3" sx={{ fontSize: 18 }}>
													PWA & мобильная поддержка
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
													Устанавливайте на экран смартфона, работайте офлайн-кешем интерфейса.
												</Typography>
												<Typography variant="h3" sx={{ fontSize: 18 }}>
													Хранение больших файлов через телеграм-каналы
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Загружайте большие файлы и папки, скачивайте архивом, управляйте доступом.
												</Typography>
											</CardContent>
										</Card>
									</Stack>
								</Grid>
							</Grid>
						</Box>

						<Box id="how-it-works">
							<Typography variant="h2" sx={{ mb: 2 }}>
								Как это работает
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12} md={6}>
									<Typography variant="h3" sx={{ mb: 1 }}>
										Шаги регистрации
									</Typography>
									<List dense>
										{[
											'Войдите через Telegram или по почте.',
											'Создайте облако, указав ID канала.',
											'Добавьте бота и назначьте его админом канала.',
											'Включите доступ по ссылке при необходимости.',
										].map((text) => (
											<ListItem>
												<ListItemIcon>
													<CheckCircleIcon color="primary" />
												</ListItemIcon>
												<ListItemText primary={text} />
											</ListItem>
										))}
									</List>
								</Grid>
								<Grid item xs={12} md={6}>
									<Typography variant="h3" sx={{ mb: 1 }}>
										Настройка облака
									</Typography>
									<List dense>
										{[
											'Подключите несколько ботов для ускорения загрузок.',
											'Создавайте папки, загружайте файлы и папки целиком.',
											'Предпросматривайте фото, видео, документы без скачивания.',
											'Включайте/отключайте публичные ссылки одним переключателем.',
										].map((text) => (
											<ListItem>
												<ListItemIcon>
													<CheckCircleIcon color="secondary" />
												</ListItemIcon>
												<ListItemText primary={text} />
											</ListItem>
										))}
									</List>
								</Grid>
							</Grid>
						</Box>

						<Box id="faq">
							<Typography variant="h2" sx={{ mb: 2 }}>
								Часто задаваемые вопросы (FAQ)
							</Typography>
							<Stack spacing={1.5}>
								{[
									{
										q: 'Что такое Telegram cloud storage?',
										a: 'Это облако, где файлы хранятся в вашем канале Telegram, а интерфейс напоминает привычный диск.',
									},
									{
										q: 'Как создать облако через Telegram?',
										a: 'Создайте канал, получите его ID через бота (@userinfobot), подключите облако и добавьте бота админом.',
									},
									{
										q: 'Безопасно ли хранение файлов?',
										a: 'Да. Данные в вашем канале, доступ по ссылке можно включать/отключать, роли доступа контролируются вами.',
									},
									{
										q: 'Можно ли работать с большими файлами?',
										a: 'Да. Telegram поддерживает крупные вложения, а cloud.boostclicks даёт загрузку, предпросмотр и скачивание архивом.',
									},
									{
										q: 'Сколько стоит использование?',
										a: 'Базовый вход бесплатный, хранение зависит от Telegram. Дополнительные тарифы можно обсудить с BoostClicks.',
									},
								].map((item) => (
									<Paper sx={{ p: 2 }}>
										<Typography variant="h3" sx={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 1 }}>
											<ExpandMoreIcon fontSize="small" />
											{item.q}
										</Typography>
										<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
											{item.a}
										</Typography>
									</Paper>
								))}
							</Stack>
						</Box>

						<Box id="cta">
							<Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
								<Typography variant="h2" sx={{ mb: 1 }}>
									Попробовать бесплатно
								</Typography>
								<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
									Создайте облако через Telegram, подключите бота и начните загрузку файлов.
								</Typography>
								<Stack direction="row" spacing={2} justifyContent="center">
									<Button variant="contained" color="secondary" onClick={() => navigate('/login')}>
										Начать с Telegram
									</Button>
									<Button variant="outlined" onClick={() => navigate('/storages')}>
										Создать облако сейчас
									</Button>
								</Stack>
							</Paper>
						</Box>
					</Stack>
				</Container>
			</Box>
			<Fab
				variant="extended"
				color="secondary"
				onClick={() => navigate('/storages/register')}
				sx={{
					position: 'fixed',
					bottom: 24,
					right: 24,
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
