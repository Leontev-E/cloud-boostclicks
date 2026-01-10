import { Show, createEffect, createSignal, onCleanup } from 'solid-js'
import Paper from '@suid/material/Paper'
import Stack from '@suid/material/Stack'
import Typography from '@suid/material/Typography'
import Button from '@suid/material/Button'
import IconButton from '@suid/material/IconButton'
import CloseIcon from '@suid/icons-material/Close'

const isMobile = () =>
	/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)

const InstallPromptBanner = () => {
	const [deferredPrompt, setDeferredPrompt] = createSignal(null)
	const [visible, setVisible] = createSignal(false)

	createEffect(() => {
		const dismissed = localStorage.getItem('cb-install-dismissed')
		if (dismissed === '1' || !isMobile()) {
			return
		}

		const handler = (e) => {
			e.preventDefault()
			setDeferredPrompt(e)
			setVisible(true)
		}

		window.addEventListener('beforeinstallprompt', handler)

		onCleanup(() => window.removeEventListener('beforeinstallprompt', handler))
	})

	const hide = () => {
		setVisible(false)
		localStorage.setItem('cb-install-dismissed', '1')
	}

	const install = async () => {
		const prompt = deferredPrompt()
		if (!prompt) return
		prompt.prompt()
		await prompt.userChoice
		hide()
	}

	return (
		<Show when={visible()}>
			<Paper
				elevation={4}
				sx={{
					position: 'fixed',
					bottom: { xs: 12, md: 20 },
					left: { xs: 12, md: 24 },
					right: { xs: 12, md: 'auto' },
					maxWidth: 420,
					zIndex: 1300,
					p: 2.25,
					borderRadius: 2,
					background: 'linear-gradient(135deg, #2aabe2, #1b6fd1)',
					color: '#fff',
					boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
				}}
			>
				<Stack spacing={1.2}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
							Установить cloud.boostclicks
						</Typography>
						<IconButton onClick={hide} sx={{ color: '#fff' }}>
							<CloseIcon />
						</IconButton>
					</Stack>
					<Typography variant="body2" sx={{ opacity: 0.9 }}>
						Добавьте облако на экран телефона, чтобы открывать файлы в один тап.
					</Typography>
					<Stack direction="row" spacing={1.2}>
						<Button
							variant="contained"
							color="secondary"
							onClick={install}
							sx={{ color: '#1b1a17' }}
						>
							Установить
						</Button>
						<Button variant="text" sx={{ color: '#fff' }} onClick={hide}>
							Позже
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Show>
	)
}

export default InstallPromptBanner
