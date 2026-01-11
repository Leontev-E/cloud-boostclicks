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
				py: 4,
				px: { xs: 2, md: 6 },
				borderTop: '1px solid rgba(27,26,23,0.08)',
				backgroundColor: '#0f172a',
				color: '#e5e7eb',
			}}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				alignItems="center"
				justifyContent="space-between"
				sx={{ maxWidth: '1200px', mx: 'auto' }}
			>
				<Stack spacing={0.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fbbf24' }}>
						BoostClicks
					</Typography>
					<Typography variant="body2">Евгений Леонтьев</Typography>
				</Stack>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={2}
					alignItems="center"
					divider={<Box sx={{ width: 2, height: 24, bgcolor: 'rgba(255,255,255,0.12)', display: { xs: 'none', md: 'block' } }} />}
				>
					<Stack direction="row" spacing={1} alignItems="center">
						<SendIcon fontSize="small" />
						<Link
							href="https://t.me/boostclicks"
							target="_blank"
							rel="noreferrer"
							underline="hover"
							sx={{ color: '#e5e7eb', fontWeight: 600 }}
						>
							@boostclicks
						</Link>
					</Stack>
					<Stack direction="row" spacing={1} alignItems="center">
						<LanguageIcon fontSize="small" />
						<Link
							href="https://boostclicks.ru"
							target="_blank"
							rel="noreferrer"
							underline="hover"
							sx={{ color: '#e5e7eb', fontWeight: 600 }}
						>
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
