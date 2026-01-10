import Dialog from '@suid/material/Dialog'
import DialogTitle from '@suid/material/DialogTitle'
import DialogContent from '@suid/material/DialogContent'
import DialogActions from '@suid/material/DialogActions'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Stack from '@suid/material/Stack'

/**
 * @typedef {Object} ShareDialogProps
 * @property {boolean} isOpened
 * @property {string} link
 * @property {() => void} onClose
 * @property {() => void} onCopy
 */

const ShareDialog = (props) => {
	return (
		<Dialog open={props.isOpened} onClose={props.onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Ссылка для доступа</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 1 }}>
					<TextField
						value={props.link || ''}
						label="Ссылка"
						fullWidth
						InputProps={{ readOnly: true }}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onCopy} color="secondary">
					Скопировать
				</Button>
				<Button onClick={props.onClose}>Закрыть</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ShareDialog
