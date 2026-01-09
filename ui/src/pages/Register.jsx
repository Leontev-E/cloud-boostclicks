import { onMount } from 'solid-js'
import Container from '@suid/material/Container'
import Box from '@suid/material/Box'
import TextField from '@suid/material/TextField'
import Button from '@suid/material/Button'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Stack from '@suid/material/Stack'
import Alert from '@suid/material/Alert'
import createLocalStore from '../../libs'
import { A, useNavigate } from '@solidjs/router'

import API from '../api'
import { alertStore } from '../components/AlertStack'

const Register = () => {
	const [store, setStore] = createLocalStore()
	const { addAlert } = alertStore
	const navigate = useNavigate()

	onMount(() => {
		if (store.access_token) {
			navigate('/')
		}
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

		await API.users.register(email, password)
		addAlert('Регистрация прошла успешно')

		const tokenData = await API.auth.login(email, password)

		setStore('access_token', tokenData.access_token)
		setStore('user', { identifier: email })

		const redirect_url = store.redirect || '/'
		navigate(redirect_url)
	}

	return (
		<Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
			<Paper sx={{ p: { xs: 3, md: 4 } }} elevation={6}>
				<Stack spacing={2}>
				<Typography variant="h5">Создать админ-аккаунт</Typography>
				<Alert severity="info">
					Для пользователей по умолчанию используется вход через Telegram.
					Создайте админскую почту только как резервный доступ.
				</Alert>
				<Divider />
				<Box component="form" onSubmit={handleSubmit}>
					<Stack spacing={2}>
						<TextField
							name="email"
							label="Электронная почта"
							type="email"
							variant="outlined"
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
							Зарегистрировать администратора
						</Button>
					</Stack>
				</Box>
				<A class="default-link" href="/login">
					Уже есть доступ? Войти.
				</A>
			</Stack>
		</Paper>
		</Container>
	)
}

export default Register
