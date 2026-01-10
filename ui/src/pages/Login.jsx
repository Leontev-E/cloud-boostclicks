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

	onMount(() => {
		if (store.access_token) {
			navigate('/')
			return
		}

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
							<Typography variant="h2" sx={{ maxWidth: 420 }}>
								Ваше облако на базе Telegram, переосмысленное.
							</Typography>
							<Typography variant="body1" color="text.secondary">
								Входите через Telegram, подключайте токены ботов и управляйте
								облаками на новом уровне.
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
					<Grid container spacing={3}>
						<Grid item xs={12} md={7}>
							<Paper sx={{ p: { xs: 3, md: 4 } }}>
								<Stack spacing={2}>
									<Typography variant="h5">
										Зачем cloud.boostclicks
									</Typography>
									<List dense>
										{[
											{
												icon: <SecurityIcon color="primary" />,
												text: 'Приватность: все файлы хранятся в вашем Telegram-канале.',
											},
											{
												icon: <FlashOnIcon color="secondary" />,
												text: 'Скорость: подключайте несколько ботов для быстрой загрузки.',
											},
											{
												icon: <LinkIcon color="primary" />,
												text: 'Ссылки: включайте/отключайте доступ по ссылке одним переключателем.',
											},
											{
												icon: <MobileFriendlyIcon color="secondary" />,
												text: 'Мобильный UI: крупные элементы, PWA, предпросмотр без скачивания.',
											},
										].map((item) => (
											<ListItem>
												<ListItemIcon>{item.icon}</ListItemIcon>
												<ListItemText primary={item.text} />
											</ListItem>
										))}
									</List>
									<Typography variant="body2" color="text.secondary">
										Ключевые запросы: телеграм облако, telegram диск, облако без
										лимитов, приватное хранилище, быстрые загрузки, мобильное
										облако, файлы по ссылке, бесплатный диск, pwa cloud.
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
								<Card>
									<CardHeader
										avatar={<CloudDoneIcon color="secondary" />}
										title="Функционал"
										subheader="Предпросмотр, ссылки, загрузка папок"
									/>
									<CardContent>
										<Typography variant="body2" color="text.secondary">
											Загружайте файлы и папки, просматривайте фото, видео,
											документы прямо в интерфейсе, делитесь ссылками на файлы и
											папки, скачивайте папку целиком.
										</Typography>
									</CardContent>
								</Card>
							</Stack>
						</Grid>
					</Grid>
				</Container>
			</Box>
			<Footer />
		</Box>
	)
}

export default Login
