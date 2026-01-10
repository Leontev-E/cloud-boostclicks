import Button from '@suid/material/Button'
import Dialog from '@suid/material/Dialog'
import DialogActions from '@suid/material/DialogActions'
import DialogContent from '@suid/material/DialogContent'
import DialogTitle from '@suid/material/DialogTitle'
import DialogContentText from '@suid/material/DialogContentText'

/**
 * @typedef {Object} ActionConfirmDialogProps
 * @property {boolean} isOpened
 * @property {string} entity
 * @property {string} action
 * @property {string} actionDescription
 * @property {() => void} onConfirm
 * @property {() => void} onCancel
 */

/**
 *
 * @param {ActionConfirmDialogProps} props
 */
const ActionConfirmDialog = (props) => {
	return (
		<Dialog open={props.isOpened} onClose={props.onCancel}>
			<DialogTitle>
				{props.action} {props.entity}?
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Вы уверены, что хотите {props.actionDescription}?
				</DialogContentText>
			</DialogContent>

			<DialogActions>
				<Button onClick={props.onConfirm} color="warning">
					Удалить
				</Button>
				<Button onClick={props.onCancel} color="info">
					Отмена
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ActionConfirmDialog
