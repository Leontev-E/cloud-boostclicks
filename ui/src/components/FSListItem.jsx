import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import MenuMUI from '@suid/material/Menu'
import MenuItem from '@suid/material/MenuItem'
import IconButton from '@suid/material/IconButton'
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@suid/icons-material/Folder'
import MoreVertIcon from '@suid/icons-material/MoreVert'
import DownloadIcon from '@suid/icons-material/Download'
import InfoIcon from '@suid/icons-material/Info'
import DeleteIcon from '@suid/icons-material/Delete'
import ShareIcon from '@suid/icons-material/Share'
import PreviewIcon from '@suid/icons-material/VisibilityOutlined'
import { Show, createSignal } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import API from '../api'
import ActionConfirmDialog from './ActionConfirmDialog'
import FileInfoDialog from './FileInfo'
import { alertStore } from './AlertStack'
import ShareDialog from './ShareDialog'

/**
 * @typedef {Object} FSListItemProps
 * @property {import("../api").FSElement} fsElement
 * @property {string} storageId
 * @property {() => {}} onDelete
 * @property {(file: import("../api").FSElement) => void} [onPreview]
 * @property {(name: string) => void} [onDownloadStart]
 * @property {(pct: number | null) => void} [onDownloadProgress]
 * @property {() => void} [onDownloadEnd]
 */

/**
 *
 * @param {FSListItemProps} props
 * @returns
 */
const FSListItem = (props) => {
	const [moreAnchorEl, setMoreAnchorEl] = createSignal(null)
	const [isActionConfirmDialogOpened, setIsActionConfirmDialogOpened] =
		createSignal(false)
	const [isInfoDialogOpened, setIsInfoDialogOpened] = createSignal(false)
	const [isShareDialogOpened, setIsShareDialogOpened] = createSignal(false)
	const [shareLink, setShareLink] = createSignal('')
	const [shareEnabled, setShareEnabled] = createSignal(false)
	const [shareLoading, setShareLoading] = createSignal(false)
	const navigate = useNavigate()
	const params = useParams()
	const { addAlert } = alertStore

	const openMore = () => Boolean(moreAnchorEl())

	const handleCloseMore = () => {
		setMoreAnchorEl(null)
	}

	const encodePath = (path) =>
		path
			.split('/')
			.map((segment) => encodeURIComponent(segment))
			.join('/')

	const getSharePath = () =>
		props.fsElement.is_file
			? props.fsElement.path
			: `${props.fsElement.path.replace(/\/?$/, '/')}`

	const handleNavigate = () => {
		if (!props.fsElement.is_file) {
			navigate(
				`/storages/${props.storageId}/files/${encodePath(props.fsElement.path)}`
			)
		} else if (props.onPreview) {
			props.onPreview(props.fsElement)
		}
	}

	const download = async () => {
		try {
			props.onDownloadStart?.(props.fsElement.name)
			const blob = props.fsElement.is_file
				? await API.files.download(
						params.id,
						props.fsElement.path,
						props.onDownloadProgress
				  )
				: await API.files.downloadFolder(
						params.id,
						`${props.fsElement.path.replace(/\/?$/, '/')}`,
						props.onDownloadProgress
				  )

			const href = URL.createObjectURL(blob)
			const a = Object.assign(document.createElement('a'), {
				href,
				style: 'display: none',
				download: props.fsElement.is_file
					? props.fsElement.name
					: `${props.fsElement.name}.zip`,
			})
			document.body.appendChild(a)

			a.click()
			URL.revokeObjectURL(href)
			a.remove()
		} catch (err) {
			addAlert('Не удалось скачать файл. Попробуйте позже.', 'error')
		} finally {
			props.onDownloadEnd?.()
		}
	}

	const openActionConfirmDialog = () => {
		handleCloseMore()
		setIsActionConfirmDialogOpened(true)
	}
	const closeActionConfirmDialog = () => {
		setIsActionConfirmDialogOpened(false)
	}

	const openPreviewDialog = () => {
		handleCloseMore()
		props.onPreview?.(props.fsElement)
	}

	const openShareDialog = async () => {
		handleCloseMore()

		const sharePath = getSharePath()

		setShareLoading(true)
		setShareEnabled(false)
		setShareLink('')

		try {
			const response = await API.files.getShareByPath(
				params.id,
				sharePath,
				!props.fsElement.is_file
			)

			if (response?.id) {
				setShareEnabled(true)
				setShareLink(`${window.location.origin}/share/${response.id}`)
			}
		} catch (err) {
			console.error(err)
			addAlert('Не удалось получить статус доступа. Попробуйте позже.', 'error')
		} finally {
			setShareLoading(false)
			setIsShareDialogOpened(true)
		}
	}

	const toggleShare = async (enabled) => {
		const sharePath = getSharePath()

		setShareLoading(true)
		try {
			if (enabled) {
				const response = await API.files.createShare(
					params.id,
					sharePath,
					!props.fsElement.is_file
				)

				const link = `${window.location.origin}/share/${response.id}`
				setShareLink(link)
				setShareEnabled(true)
				addAlert('Доступ по ссылке включен', 'success')
			} else {
				await API.files.deleteShareByPath(
					params.id,
					sharePath,
					!props.fsElement.is_file
				)

				setShareLink('')
				setShareEnabled(false)
				addAlert('Доступ по ссылке отключен', 'success')
			}
		} catch (err) {
			console.error(err)
			addAlert('Не удалось обновить доступ. Попробуйте позже.', 'error')
		} finally {
			setShareLoading(false)
		}
	}

	const copyShareLink = async () => {
		if (!shareLink()) return
		try {
			await navigator.clipboard.writeText(shareLink())
			addAlert('Ссылка скопирована', 'success')
		} catch (err) {
			addAlert('Не удалось скопировать ссылку', 'error')
		}
	}

	const deleteFile = async () => {
		closeActionConfirmDialog()
		const deletePath = props.fsElement.is_file
			? props.fsElement.path
			: `${props.fsElement.path.replace(/\/?$/, '/')}`

		try {
			const result = await API.files.deleteFile(params.id, deletePath)
			if (props.fsElement.is_file) {
				addAlert(`Файл "${props.fsElement.name}" удален`, 'success')
			} else if (result?.deleted_files > 0) {
				addAlert(
					`Папка "${props.fsElement.name}" удалена вместе с файлами (${result.deleted_files})`,
					'success'
				)
			} else {
				addAlert(`Папка "${props.fsElement.name}" удалена`, 'success')
			}
			props.onDelete()
		} catch (err) {
			addAlert('Не удалось удалить элемент. Попробуйте позже.', 'error')
		}
	}

	const deleteDescription = props.fsElement.is_file
		? `Удалить "${props.fsElement.name}"`
		: `Удалить папку "${props.fsElement.name}". Все файлы внутри будут удалены`

	return (
		<>
			<ListItem disablePadding>
				<ListItemButton onClick={handleNavigate}>
					<ListItemIcon>
						<Show when={props.fsElement.is_file} fallback={<FolderIcon />}>
							<FileIcon />
						</Show>
					</ListItemIcon>
					<ListItemText primary={props.fsElement.name} />
				</ListItemButton>
				<IconButton
					onClick={(event) => {
						setMoreAnchorEl(event.currentTarget)
					}}
				>
					<MoreVertIcon />
				</IconButton>
			</ListItem>
			<MenuMUI
				id="basic-menu"
				anchorEl={moreAnchorEl()}
				open={openMore()}
				onClose={handleCloseMore}
				MenuListProps={{ 'aria-labelledby': 'basic-button' }}
			>
				<Show when={props.fsElement.is_file}>
					<MenuItem onClick={openPreviewDialog}>
						<ListItemIcon>
							<PreviewIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Предпросмотр</ListItemText>
					</MenuItem>
				</Show>

				<MenuItem onClick={() => setIsInfoDialogOpened(true)}>
					<ListItemIcon>
						<InfoIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Информация</ListItemText>
				</MenuItem>

				<MenuItem onClick={download}>
					<ListItemIcon>
						<DownloadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>
						{props.fsElement.is_file ? 'Скачать' : 'Скачать папку'}
					</ListItemText>
				</MenuItem>

				<MenuItem onClick={openShareDialog}>
					<ListItemIcon>
						<ShareIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Поделиться</ListItemText>
				</MenuItem>

				<MenuItem onClick={openActionConfirmDialog}>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Удалить</ListItemText>
				</MenuItem>
			</MenuMUI>

			<ActionConfirmDialog
				action="Удалить"
				entity="элемент"
				actionDescription={deleteDescription}
				isOpened={isActionConfirmDialogOpened()}
				onConfirm={deleteFile}
				onCancel={closeActionConfirmDialog}
			/>

			<FileInfoDialog
				file={props.fsElement}
				isOpened={isInfoDialogOpened()}
				onClose={() => setIsInfoDialogOpened(false)}
			/>

			<ShareDialog
				isOpened={isShareDialogOpened()}
				link={shareLink()}
				enabled={shareEnabled()}
				isLoading={shareLoading()}
				onClose={() => setIsShareDialogOpened(false)}
				onCopy={copyShareLink}
				onToggle={toggleShare}
			/>
		</>
	)
}

export default FSListItem
