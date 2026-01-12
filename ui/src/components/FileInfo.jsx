import Grid from '@suid/material/Grid'
import Dialog from '@suid/material/Dialog'
import DialogContent from '@suid/material/DialogContent'
import DialogTitle from '@suid/material/DialogTitle'
import Typography from '@suid/material/Typography'
import Stack from '@suid/material/Stack'
import Button from '@suid/material/Button'

import { convertSize } from '../common/size_converter'

/**
 * @typedef {Object} FileInfoDialogProps
 * @property {import('../api').FSElement} file
 * @property {boolean} isOpened
 * @property {() => void} onClose
 * @property {() => void} [onDownload]
 */

const readableType = (file) => {
	if (!file?.is_file) return 'Папка'
	const name = file?.name?.toLowerCase() || ''
	const parts = name.split('.')
	const ext = parts.length > 1 ? parts.pop() : ''
	return ext ? `Файл · .${ext}` : 'Файл'
}

const FileInfoDialog = (props) => {
	if (!props.file) return null

	return (
		<Dialog open={props.isOpened} onClose={props.onClose} fullWidth maxWidth="sm">
			<DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>
				Информация об объекте
			</DialogTitle>
			<DialogContent>
				<Stack spacing={2}>
					<Grid container spacing={2}>
						<Grid item xs={5}>
							<Typography fontWeight={600}>Имя</Typography>
						</Grid>
						<Grid item xs={7}>
							<Typography>{props.file.name}</Typography>
						</Grid>

						<Grid item xs={5}>
							<Typography fontWeight={600}>Тип</Typography>
						</Grid>
						<Grid item xs={7}>
							<Typography color="text.secondary">{readableType(props.file)}</Typography>
						</Grid>

						<Grid item xs={5}>
							<Typography fontWeight={600}>Размер</Typography>
						</Grid>
						<Grid item xs={7}>
							<Typography color="text.secondary">
								{props.file.is_file ? convertSize(props.file.size) : '—'}
							</Typography>
						</Grid>

						<Grid item xs={5}>
							<Typography fontWeight={600}>Дата добавления</Typography>
						</Grid>
						<Grid item xs={7}>
							<Typography color="text.secondary">недоступно</Typography>
						</Grid>
					</Grid>

					{props.file.is_file ? (
						<Button
							variant="contained"
							onClick={() => {
								props.onDownload?.()
								props.onClose?.()
							}}
						>
							Скачать
						</Button>
					) : null}
				</Stack>
			</DialogContent>
		</Dialog>
	)
}

export default FileInfoDialog
