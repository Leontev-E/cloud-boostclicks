import Dialog from '@suid/material/Dialog'
import DialogContent from '@suid/material/DialogContent'
import DialogTitle from '@suid/material/DialogTitle'
import CircularProgress from '@suid/material/CircularProgress'
import Typography from '@suid/material/Typography'
import Box from '@suid/material/Box'
import { createEffect, createSignal, onCleanup, Show } from 'solid-js'

import API from '../api'

const textExtensions = new Set(['txt', 'md', 'csv', 'json', 'log'])
const officeExtensions = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])
const videoExtensions = new Set(['mp4', 'mov', 'webm', 'mkv'])
const audioExtensions = new Set(['mp3', 'wav', 'ogg', 'aac'])

const getExtension = (name = '') => {
	const parts = name.toLowerCase().split('.')
	return parts.length > 1 ? parts[parts.length - 1] : ''
}

/**
 * @typedef {Object} FilePreviewDialogProps
 * @property {import('../api').FSElement} file
 * @property {string} storageId
 * @property {boolean} isOpened
 * @property {() => void} onClose
 */

const FilePreviewDialog = (props) => {
	const [status, setStatus] = createSignal('idle')
	const [objectUrl, setObjectUrl] = createSignal('')
	const [textContent, setTextContent] = createSignal('')
	const [fileType, setFileType] = createSignal('')
	const [fileName, setFileName] = createSignal('')

	const reset = () => {
		setStatus('idle')
		setTextContent('')
		setFileType('')
		setFileName('')
		if (objectUrl()) {
			URL.revokeObjectURL(objectUrl())
			setObjectUrl('')
		}
	}

	const getPreviewMode = (blobType, name) => {
		const ext = getExtension(name)
		if (officeExtensions.has(ext)) return 'office'
		if (imageExtensions.has(ext) || blobType.startsWith('image/')) return 'image'
		if (videoExtensions.has(ext) || blobType.startsWith('video/')) return 'video'
		if (audioExtensions.has(ext) || blobType.startsWith('audio/')) return 'audio'
		if (ext === 'pdf' || blobType === 'application/pdf') return 'pdf'
		if (textExtensions.has(ext) || blobType.startsWith('text/')) return 'text'
		return 'unsupported'
	}

	createEffect(() => {
		if (!props.isOpened || !props.file?.is_file) {
			reset()
			return
		}

		let canceled = false
		reset()
		setStatus('loading')
		setFileName(props.file.name)

		const ext = getExtension(props.file.name)
		if (officeExtensions.has(ext)) {
			setFileType('office')
			setStatus('ready')
			return
		}

		API.files
			.download(props.storageId, props.file.path)
			.then(async (blob) => {
				if (canceled) {
					return
				}

				const mode = getPreviewMode(blob.type, props.file.name)
				setFileType(mode)

				if (mode === 'text') {
					const text = await blob.text()
					if (canceled) {
						return
					}
					setTextContent(text)
				} else if (mode !== 'unsupported') {
					const url = URL.createObjectURL(blob)
					setObjectUrl(url)
				}

				setStatus('ready')
			})
			.catch(() => {
				if (!canceled) {
					setStatus('error')
				}
			})

		onCleanup(() => {
			canceled = true
		})
	})

	return (
		<Dialog open={props.isOpened} onClose={props.onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ textAlign: 'center' }}>
				Предпросмотр: {fileName() || 'Файл'}
			</DialogTitle>
			<DialogContent>
				<Show when={status() === 'loading'}>
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress />
					</Box>
				</Show>

				<Show when={status() === 'error'}>
					<Typography color="error">
						Не удалось открыть файл. Попробуйте скачать его.
					</Typography>
				</Show>

				<Show when={status() === 'ready' && fileType() === 'image'}>
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<img
							src={objectUrl()}
							alt={fileName()}
							style="max-width: 100%; max-height: 70vh;"
						/>
					</Box>
				</Show>

				<Show when={status() === 'ready' && fileType() === 'video'}>
					<video
						controls
						src={objectUrl()}
						style="width: 100%; max-height: 70vh;"
					/>
				</Show>

				<Show when={status() === 'ready' && fileType() === 'audio'}>
					<audio controls src={objectUrl()} style="width: 100%;" />
				</Show>

				<Show when={status() === 'ready' && fileType() === 'pdf'}>
					<iframe
						src={objectUrl()}
						title="PDF preview"
						style="width: 100%; height: 70vh; border: none;"
					/>
				</Show>

				<Show when={status() === 'ready' && fileType() === 'text'}>
					<Box
						sx={{
							maxHeight: '70vh',
							overflow: 'auto',
							backgroundColor: 'rgba(0,0,0,0.03)',
							borderRadius: 2,
							padding: 2,
						}}
					>
						<pre style="margin: 0; white-space: pre-wrap;">
							{textContent()}
						</pre>
					</Box>
				</Show>

				<Show when={status() === 'ready' && fileType() === 'office'}>
					<Typography>
						Office-документы требуют публичный URL для предпросмотра. Создайте
						ссылку на файл или скачайте его.
					</Typography>
				</Show>

				<Show when={status() === 'ready' && fileType() === 'unsupported'}>
					<Typography>
						Предпросмотр недоступен для этого типа файла. Скачайте файл,
						чтобы открыть его.
					</Typography>
				</Show>
			</DialogContent>
		</Dialog>
	)
}

export default FilePreviewDialog
