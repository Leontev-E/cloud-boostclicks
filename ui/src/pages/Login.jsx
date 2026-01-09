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
import createLocalStore from '../../libs'
import { A, useNavigate } from '@solidjs/router'

import API from '../api'
import Footer from '../components/Footer'
import { alertStore } from '../components/AlertStack'

const Login = () => {
	const [store, setStore] = createLocalStore()
	const [telegramError, setTelegramError] = createSignal()
	const { addAlert } = alertStore
	const navigate = useNavigate()
	let telegramRoot

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

		const tokenData = await API.auth.login(email, password)

		setStore('access_token', tokenData.access_token)
		setStore('user', { identifier: email })

		const redirect_url = store.redirect || '/'
		navigate(redirect_url)
	}

	return (
		<>
			<Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
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
								<Typography variant="h5">Вход в приложение</Typography>
								<Typography variant="body2" color="text.secondary">
									Войдите через Telegram, чтобы продолжить.
								</Typography>
								<Box ref={(el) => (telegramRoot = el)} sx={{ minHeight: 54 }} />
								{telegramError() ? (
									<Alert severity="warning">{telegramError()}</Alert>
								) : null}
								<Divider>или войдите по почте</Divider>
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
											Войти
										</Button>
									</Stack>
								</Box>
								<A class="default-link" href="/register">
									Еще нет аккаунта? Зарегистрироваться.
								</A>
							</Stack>
						</Paper>
					</Grid>
				</Grid>
			</Container>
			<Footer />
		</>
	)
}

export default Login
