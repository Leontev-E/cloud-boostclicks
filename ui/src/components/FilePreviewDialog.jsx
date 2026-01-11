import Dialog from '@suid/material/Dialog'
import DialogContent from '@suid/material/DialogContent'
import DialogTitle from '@suid/material/DialogTitle'
import CircularProgress from '@suid/material/CircularProgress'
import Typography from '@suid/material/Typography'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import Stack from '@suid/material/Stack'
import Switch from '@suid/material/Switch'
import FormControlLabel from '@suid/material/FormControlLabel'
import Link from '@suid/material/Link'
import { createEffect, createSignal, onCleanup, Show } from 'solid-js'

import API from '../api'
import { alertStore } from './AlertStack'
import { convertSize } from '../common/size_converter'

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
	const { addAlert } = alertStore
	const [status, setStatus] = createSignal('idle')
	const [objectUrl, setObjectUrl] = createSignal('')
	const [textContent, setTextContent] = createSignal('')
	const [fileType, setFileType] = createSignal('')
	const [fileName, setFileName] = createSignal('')
	const [shareEnabled, setShareEnabled] = createSignal(false)
	const [shareLink, setShareLink] = createSignal('')
	const [shareLoading, setShareLoading] = createSignal(false)

	const reset = () => {
		setStatus('idle')
		setTextContent('')
		setFileType('')
		setFileName('')
		setShareEnabled(false)
		setShareLink('')
		if (objectUrl()) {
			URL.revokeObjectURL(objectUrl())
			setObjectUrl('')
		}
	}

	const guessMime = (name) => {
		const ext = getExtension(name)
		if (imageExtensions.has(ext)) return 'image/' + (ext === 'svg' ? 'svg+xml' : 'jpeg')
		if (videoExtensions.has(ext)) return 'video/mp4'
		if (audioExtensions.has(ext)) return 'audio/mpeg'
		if (ext === 'pdf') return 'application/pdf'
		if (textExtensions.has(ext)) return 'text/plain'
		return 'application/octet-stream'
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
		setShareLoading(true)
		API.files
			.getShareByPath(props.storageId, props.file.path, false)
			.then((response) => {
				if (response?.id) {
					setShareEnabled(true)
					setShareLink(`${window.location.origin}/share/${response.id}`)
				}
			})
			.finally(() => setShareLoading(false))

		const ext = getExtension(props.file.name)
		if (officeExtensions.has(ext)) {
			setFileType('office')
			setStatus('ready')
			return
		}

		API.files
			.download(props.storageId, props.file.path)
			.then(async (blob) => {
				if (canceled) return

				const effectiveBlob =
					blob.type && blob.type !== 'application/octet-stream'
						? blob
						: new Blob([await blob.arrayBuffer()], {
								type: guessMime(props.file.name),
						  })

				const mode = getPreviewMode(effectiveBlob.type || '', props.file.name)
				setFileType(mode || 'unsupported')

				if (mode === 'text') {
					const text = await effectiveBlob.text()
					if (canceled) return
					setTextContent(text)
				} else if (mode !== 'unsupported') {
					const url = URL.createObjectURL(effectiveBlob)
					setObjectUrl(url)
				}

				setStatus('ready')
			})
			.catch(() => {
				if (!canceled) {
					setFileType('unsupported')
					setStatus('ready')
				}
			})

		onCleanup(() => {
			canceled = true
		})
	})

	const toggleShare = async (enabled) => {
		if (!props.file) return
		setShareLoading(true)
		try {
			if (enabled) {
				const response = await API.files.createShare(
					props.storageId,
					props.file.path,
					false
				)
				setShareLink(`${window.location.origin}/share/${response.id}`)
				setShareEnabled(true)
				addAlert('Доступ по ссылке включен', 'success')
			} else {
				await API.files.deleteShareByPath(props.storageId, props.file.path, false)
				setShareLink('')
				setShareEnabled(false)
				addAlert('Доступ по ссылке отключен', 'success')
			}
		} catch (err) {
			addAlert('Не удалось обновить доступ. Попробуйте позже.', 'error')
		} finally {
			setShareLoading(false)
		}
	}

	return (
		<Dialog open={props.isOpened} onClose={props.onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ textAlign: 'center' }}>
				Предпросмотр: {fileName() || 'Файл'}
			</DialogTitle>
			<DialogContent>
				<Stack spacing={1.5} sx={{ mb: 2 }}>
					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
						<Typography variant="body2">Размер: {convertSize(props.file?.size || 0)}</Typography>
						<Typography variant="body2">
							Тип файла: {getExtension(props.file?.name) || 'неизвестно'} (дата недоступна)
						</Typography>
					</Stack>
					<FormControlLabel
						control={
							<Switch
								checked={shareEnabled()}
								disabled={shareLoading()}
								onChange={(_, v) => toggleShare(v)}
							/>
						}
						label="Открыть доступ по ссылке"
					/>
					<Show when={shareEnabled() && shareLink()}>
						<Link href={shareLink()} target="_blank" rel="noreferrer">
							{shareLink()}
						</Link>
					</Show>
				</Stack>

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
					<Button
						variant="outlined"
						onClick={() => {
							if (objectUrl()) {
								const a = Object.assign(document.createElement('a'), {
									href: objectUrl(),
									download: fileName() || 'file',
									style: 'display: none',
								})
								document.body.appendChild(a)
								a.click()
								a.remove()
							}
						}}
					>
						Скачать
					</Button>
				</Show>
			</DialogContent>
		</Dialog>
	)
}

export default FilePreviewDialog
