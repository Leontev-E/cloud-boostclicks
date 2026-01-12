import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import MenuMUI from '@suid/material/Menu'
import MenuItem from '@suid/material/MenuItem'
import IconButton from '@suid/material/IconButton'
import MoreVertIcon from '@suid/icons-material/MoreVert'
import DownloadIcon from '@suid/icons-material/Download'
import InfoIcon from '@suid/icons-material/Info'
import DeleteIcon from '@suid/icons-material/Delete'
import ShareIcon from '@suid/icons-material/Share'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import { Show, createSignal } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'
import {
	Folder as LucideFolder,
	Image as LucideImage,
	FileVideo as LucideFileVideo,
	Music as LucideMusic,
	FileText as LucideFileText,
	FileSpreadsheet as LucideFileSpreadsheet,
	FileArchive as LucideFileArchive,
	FileType as LucideFileType,
} from 'lucide-solid'

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

	const getExtension = (name = '') => {
		const parts = name.toLowerCase().split('.')
		return parts.length > 1 ? parts[parts.length - 1] : ''
	}

	const getFileIcon = (fsElement) => {
		if (!fsElement.is_file) return <LucideFolder color="#f59e0b" size={22} />
		const ext = getExtension(fsElement.name)
		if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
			return <LucideImage color="#2563eb" size={22} />
		}
		if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) {
			return <LucideFileVideo color="#7c3aed" size={22} />
		}
		if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
			return <LucideMusic color="#10b981" size={22} />
		}
		if (ext === 'pdf') {
			return <LucideFileArchive color="#ef4444" size={22} />
		}
		if (['xls', 'xlsx'].includes(ext)) {
			return <LucideFileSpreadsheet color="#0ea5e9" size={22} />
		}
		if (['doc', 'docx', 'ppt', 'pptx', 'txt', 'md', 'csv'].includes(ext)) {
			return <LucideFileText color="#0ea5e9" size={22} />
		}
		return <LucideFileType color="#475569" size={22} />
	}

	const getSharePath = () =>
		props.fsElement.is_file
			? props.fsElement.path
			: `${props.fsElement.path.replace(/\/?$/, '/')}`

	const handleNavigate = () => {
		if (!props.fsElement.is_file) {
			navigate(
				`/storages/${props.storageId}/files/${encodePath(props.fsElement.path)}`
			)
		} else {
			setIsInfoDialogOpened(true)
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
			<Paper
				elevation={0}
				sx={{
					borderRadius: { xs: 2, md: 1.5 },
					border: '1px solid rgba(15,23,42,0.08)',
					boxShadow: {
						xs: '0 12px 30px rgba(15,23,42,0.08)',
						md: 'none',
					},
					bgcolor: 'background.paper',
				}}
			>
				<ListItem
					disablePadding
					sx={{
						alignItems: 'center',
						px: { xs: 1.25, md: 0.5 },
						py: { xs: 1, md: 0 },
					}}
				>
					<ListItemButton
						onClick={handleNavigate}
						sx={{
							borderRadius: 1.5,
							gap: 1,
							py: { xs: 1, md: 0.75 },
							px: { xs: 1, md: 1 },
							minHeight: 56,
							alignItems: 'center',
						}}
					>
						<ListItemIcon sx={{ minWidth: 36 }}>{getFileIcon(props.fsElement)}</ListItemIcon>
						<ListItemText
							primary={
								<Typography sx={{ fontWeight: 700 }}>
									{props.fsElement.name}
								</Typography>
							}
							secondary={
								<Typography variant="caption" color="text.secondary">
									{props.fsElement.is_file ? 'Файл' : 'Папка'}
								</Typography>
							}
						/>
					</ListItemButton>
					<IconButton
						onClick={(event) => {
							setMoreAnchorEl(event.currentTarget)
						}}
						aria-label="Дополнительные действия"
						sx={{ mx: 0.5 }}
					>
						<MoreVertIcon />
					</IconButton>
				</ListItem>
			</Paper>
				<MenuMUI
					id="basic-menu"
					anchorEl={moreAnchorEl()}
					open={openMore()}
					onClose={handleCloseMore}
					MenuListProps={{ 'aria-labelledby': 'basic-button' }}
				>
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
					onDownload={download}
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
