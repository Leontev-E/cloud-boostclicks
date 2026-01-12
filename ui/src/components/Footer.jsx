import Box from '@suid/material/Box'
import Link from '@suid/material/Link'
import Stack from '@suid/material/Stack'
import Typography from '@suid/material/Typography'
import SendIcon from '@suid/icons-material/Send'
import LanguageIcon from '@suid/icons-material/Language'
import ShieldIcon from '@suid/icons-material/ShieldOutlined'

const Footer = () => {
	return (
		<Box
			component="footer"
			sx={{
				mt: 'auto',
				py: 3,
				px: { xs: 2, md: 6 },
				borderTop: '1px solid rgba(15,23,42,0.08)',
				backgroundColor: '#f8fafc',
			}}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				alignItems="center"
				justifyContent="space-between"
				sx={{ maxWidth: '1200px', mx: 'auto' }}
			>
				<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
					BoostClicks · Евгений Леонтьев
				</Typography>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={2}
					alignItems="center"
				>
					<Stack direction="row" spacing={1} alignItems="center">
						<SendIcon fontSize="small" />
						<Link href="https://t.me/boostclicks" target="_blank" rel="noreferrer" underline="hover">
							@boostclicks
						</Link>
					</Stack>
					<Stack direction="row" spacing={1} alignItems="center">
						<LanguageIcon fontSize="small" />
						<Link href="https://boostclicks.ru" target="_blank" rel="noreferrer" underline="hover">
							boostclicks.ru
						</Link>
					</Stack>
					<Stack direction="row" spacing={1} alignItems="center">
						<ShieldIcon fontSize="small" />
						<Typography variant="body2">Приватность данных</Typography>
					</Stack>
				</Stack>
			</Stack>
		</Box>
	)
}

export default Footer
