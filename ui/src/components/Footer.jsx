import Box from '@suid/material/Box'
import Container from '@suid/material/Container'
import Link from '@suid/material/Link'
import Stack from '@suid/material/Stack'
import Typography from '@suid/material/Typography'

const Footer = () => {
	return (
		<Box
			component="footer"
			sx={{
				mt: { xs: 6, md: 8 },
				py: 3,
				borderTop: '1px solid rgba(27,26,23,0.08)',
				backgroundColor: 'rgba(255,255,255,0.72)',
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={0.5}>
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						BoostClicks — Евгений Леонтьев
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Telegram:{' '}
						<Link href="https://t.me/boostclicks" target="_blank" rel="noreferrer">
							https://t.me/boostclicks
						</Link>
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Сайт:{' '}
						<Link href="https://boostclicks.ru" target="_blank" rel="noreferrer">
							https://boostclicks.ru
						</Link>
					</Typography>
				</Stack>
			</Container>
		</Box>
	)
}

export default Footer
