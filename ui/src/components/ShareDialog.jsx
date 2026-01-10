import Dialog from '@suid/material/Dialog'
import DialogTitle from '@suid/material/DialogTitle'
import DialogContent from '@suid/material/DialogContent'
import DialogActions from '@suid/material/DialogActions'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Stack from '@suid/material/Stack'
import Switch from '@suid/material/Switch'
import FormControlLabel from '@suid/material/FormControlLabel'
import Typography from '@suid/material/Typography'
import { Show } from 'solid-js'

/**
 * @typedef {Object} ShareDialogProps
 * @property {boolean} isOpened
 * @property {string} link
 * @property {boolean} enabled
 * @property {boolean} isLoading
 * @property {() => void} onClose
 * @property {() => void} [onCopy]
 * @property {(enabled: boolean) => void} [onToggle]
 */

const ShareDialog = (props) => {
	return (
		<Dialog open={props.isOpened} onClose={props.onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Доступ по ссылке</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 1 }}>
					<FormControlLabel
						control={
							<Switch
								checked={props.enabled}
								onChange={(_, checked) => props.onToggle?.(checked)}
								disabled={props.isLoading}
							/>
						}
						label={props.enabled ? 'Открыто по ссылке' : 'Закрыто по ссылке'}
					/>

					<Typography variant="body2" color="text.secondary">
						Ссылку видят только те, кому вы её отправите. Вы можете в любой
						момент отключить доступ.
					</Typography>

					<Show when={props.enabled}>
						<TextField
							value={props.link || ''}
							label="Ссылка"
							fullWidth
							InputProps={{ readOnly: true }}
						/>
					</Show>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Show when={props.enabled}>
					<Button
						component="a"
						href={props.link}
						target="_blank"
						rel="noreferrer"
						disabled={!props.link}
					>
						Открыть ссылку
					</Button>
					<Button onClick={props.onCopy} color="secondary" disabled={!props.link}>
						Скопировать
					</Button>
				</Show>
				<Button onClick={props.onClose}>Закрыть</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ShareDialog
