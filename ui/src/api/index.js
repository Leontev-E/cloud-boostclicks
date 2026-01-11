import createLocalStore from '../../libs'

import apiRequest, {
	API_BASE,
	apiMultipartRequest,
	handleUnauthorized,
} from './request'

/////////////////////////////////////////////////////////////
////  USERS
/////////////////////////////////////////////////////////////

/**
 * @typedef {Object} TokenData
 * @property {string} access_token
 */

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>}
 */
const register = async (email, password) => {
	return await apiRequest('/users', 'post', undefined, {
		email,
		password,
	})
}

/////////////////////////////////////////////////////////////
////  AUTH
/////////////////////////////////////////////////////////////

/**
 * @typedef {Object} TokenData
 * @property {string} access_token
 */

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<TokenData>}
 */
const login = async (email, password) => {
	return await apiRequest('/auth/login', 'post', undefined, {
		email,
		password,
	})
}

/**
 *
 * @param {Record<string, any>} payload
 * @returns {Promise<TokenData>}
 */
const telegramLogin = async (payload) => {
	return await apiRequest('/auth/telegram', 'post', undefined, payload)
}

/////////////////////////////////////////////////////////////
////  STORAGES
/////////////////////////////////////////////////////////////

/**
 *
 * @param {string} name
 * @param {number} chat_id
 * @returns
 */
const createStorage = async (name, chat_id) => {
	return await apiRequest('/storages', 'post', getAuthToken(), {
		name,
		chat_id,
	})
}

/**
 * @typedef {Object} Storage
 * @property {string} id
 * @property {string} name
 * @property {number} chat_id
 */

/**
 * @typedef {Object} StorageWithInfoProperties
 * @property {number} size
 * @property {number} files_amount
 * @typedef {Storage & StorageWithInfoProperties} StorageWithInfo
 */

/**
 * @typedef {Object} StoragesSchema
 * @property {StorageWithInfo[]} storages
 */

/**
 *
 * @returns {Promise<StoragesSchema>}
 */
const listStorages = async () => {
	return await apiRequest('/storages', 'get', getAuthToken())
}

/**
 * @param {string} id
 * @returns {Promise<Storage>}
 */
const getStorage = async (id) => {
	return await apiRequest(`/storages/${id}`, 'get', getAuthToken())
}

/////////////////////////////////////////////////////////////
////  ACCESS
/////////////////////////////////////////////////////////////

/**
 * @typedef {'R' | 'W' | 'A'} AccessType
 */

/**
 * @typedef {Object} UserWithAccess
 * @property {string} id
 * @property {string} email
 * @property {AccessType} access_type
 */

/**
 *
 * @param {string} storageID
 * @param {string} email
 * @param {AccessType} accessType
 * @returns
 */
const grantAccess = async (storageID, email, accessType) => {
	return await apiRequest(
		`/storages/${storageID}/access`,
		'post',
		getAuthToken(),
		{ user_email: email, access_type: accessType }
	)
}

/**
 *
 * @param {string} storageID
 * @returns {Promise<UserWithAccess[]>}
 */
const listUsersWithAccess = async (storageID) => {
	return await apiRequest(
		`/storages/${storageID}/access`,
		'get',
		getAuthToken()
	)
}

/**
 *
 * @param {string} storageID
 * @param {string} userID
 * @returns
 */
const restrictAccess = async (storageID, userID) => {
	return await apiRequest(
		`/storages/${storageID}/access`,
		'delete',
		getAuthToken(),
		{ user_id: userID }
	)
}

/////////////////////////////////////////////////////////////
////  STORAGE WORKERS
/////////////////////////////////////////////////////////////

/**
 * @typedef {Object} StorageWorker
 * @property {string} id
 * @property {string} name
 * @property {number} storage_id
 * @property {number} token
 */

/**
 *
 * @param {string} name
 * @param {string} token
 * @param {string | null | undefined} storage_id
 * @returns {Promise<StorageWorker>}
 */
const createStorageWorker = async (name, token, storage_id) => {
	return await apiRequest('/storage_workers', 'post', getAuthToken(), {
		name,
		token,
		storage_id,
	})
}

/**
 *
 * @returns {Promise<StorageWorker[]>}
 */
const listStorageWorkers = async () => {
	return await apiRequest('/storage_workers', 'get', getAuthToken())
}

/////////////////////////////////////////////////////////////
////  FILES
/////////////////////////////////////////////////////////////

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @param {string} folderName
 * @returns
 */
const createFolder = async (storage_id, path, folderName) => {
	return await apiRequest(
		`/storages/${storage_id}/files/create_folder`,
		'post',
		getAuthToken(),
		{ path, folder_name: folderName }
	)
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @param {any} file
 * @returns
 */
const uploadFile = async (storage_id, path, file) => {
	const form = new FormData()
	form.append('file', file)
	form.append('path', path)

	return await apiMultipartRequest(
		`/storages/${storage_id}/files/upload`,
		getAuthToken(),
		form
	)
}

const uploadFileChunked = (
	storage_id,
	path,
	chunk,
	chunkIndex,
	totalChunks,
	existingFileId,
	totalSize,
	onProgress
) =>
	new Promise((resolve, reject) => {
		const form = new FormData()
		form.append('chunk', chunk)
		form.append('path', path)
		form.append('chunk_index', String(chunkIndex))
		form.append('total_chunks', String(totalChunks))
		if (existingFileId) {
			form.append('file_id', existingFileId)
		}
		if (chunkIndex === 0) {
			form.append('size', String(totalSize || chunk.size || chunk.length || 0))
		}

		const xhr = new XMLHttpRequest()
		const apiBase = import.meta.env.VITE_API_BASE || '/api'
		xhr.open('POST', `${apiBase}/storages/${storage_id}/files/upload_chunked`)
		xhr.setRequestHeader('Authorization', getAuthToken())
		xhr.timeout = 0
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable && typeof onProgress === 'function') {
				onProgress(e.loaded)
			}
		}
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const data = JSON.parse(xhr.responseText || '{}')
					resolve(data)
				} catch (err) {
					resolve({})
				}
			} else {
				reject(new Error(xhr.responseText || 'upload failed'))
			}
		}
		xhr.onerror = () => reject(new Error('upload failed'))
		xhr.ontimeout = () => reject(new Error('upload timeout'))
		xhr.send(form)
	})

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @param {any} file
 * @returns
 */
const uploadFileTo = async (storage_id, path, file) => {
	const form = new FormData()
	form.append('file', file)
	form.append('path', path)

	return await apiMultipartRequest(
		`/storages/${storage_id}/files/upload_to`,
		getAuthToken(),
		form
	)
}

const encodePath = (path = '') =>
	path
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/')

/**
 * @typedef {Object} FSElement
 * @property {string} path
 * @property {string} name
 * @property {boolean} is_file
 * @property {number} size
 */

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @returns {Promise<FSElement[]>}
 */
const getFSLayer = async (storage_id, path) => {
	const safePath = encodePath(path || '')
	return await apiRequest(
		`/storages/${storage_id}/files/tree/${safePath}`,
		'get',
		getAuthToken()
	)
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @returns {Promise<Blob>}
 */
const streamDownload = async (url, authToken, onProgress) => {
	const headers = new Headers()
	if (authToken) headers.append('Authorization', authToken)

	const response = await fetch(url, { method: 'get', headers })

	if (response.status === 401) {
		handleUnauthorized()
	}
	if (!response.ok) {
		throw new Error(await response.text())
	}

	if (!onProgress) {
		return await response.blob()
	}

	const total = Number(response.headers.get('content-length')) || 0
	const reader = response.body?.getReader()
	if (!reader) return await response.blob()

	const chunks = []
	let loaded = 0
	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		if (value) {
			chunks.push(value)
			loaded += value.length
			if (typeof onProgress === 'function') {
				if (total > 0) {
					onProgress(Math.min(100, Math.round((loaded / total) * 100)))
				} else {
					onProgress(null)
				}
			}
		}
	}

	const blob = new Blob(chunks, {
		type: response.headers.get('content-type') || 'application/octet-stream',
	})
	return blob
}

const download = async (storage_id, path, onProgress) => {
	const safePath = encodePath(path || '')
	const apiBase = import.meta.env.VITE_API_BASE || '/api'
	const url = `${apiBase}/storages/${storage_id}/files/download/${safePath}`
	return await streamDownload(url, getAuthToken(), onProgress)
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @returns {Promise<Blob>}
 */
const downloadFolder = async (storage_id, path, onProgress) => {
	const safePath = encodePath(path || '')
	const apiBase = import.meta.env.VITE_API_BASE || '/api'
	const url = `${apiBase}/storages/${storage_id}/files/download_folder/${safePath}`
	return await streamDownload(url, getAuthToken(), onProgress)
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 */
const deleteFile = async (storage_id, path) => {
	const safePath = encodePath(path || '')
	return await apiRequest(
		`/storages/${storage_id}/files/${safePath}`,
		'delete',
		getAuthToken()
	)
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @param {boolean} is_folder
 * @returns {Promise<{id: string}>}
 */
const createShare = async (storage_id, path, is_folder) => {
	return await apiRequest(
		`/storages/${storage_id}/files/share`,
		'post',
		getAuthToken(),
		{ path, is_folder }
	)
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @param {boolean} is_folder
 * @returns {Promise<ShareInfo>}
 */
const getShareByPath = async (storage_id, path, is_folder) => {
	const safePath = encodeURIComponent(path || '')
	const response = await fetch(
		`${API_BASE}/storages/${storage_id}/files/share?path=${safePath}&is_folder=${is_folder}`,
		{
			method: 'get',
			headers: { Authorization: getAuthToken() },
		}
	)

	if (response.status === 401) {
		handleUnauthorized()
	}

	if (response.status === 404) {
		return null
	}

	if (!response.ok) {
		throw new Error(await response.text())
	}

	return await response.json()
}

/**
 *
 * @param {string} storage_id
 * @param {string} path
 * @param {boolean} is_folder
 * @returns {Promise<void>}
 */
const deleteShareByPath = async (storage_id, path, is_folder) => {
	const safePath = encodeURIComponent(path || '')
	const response = await fetch(
		`${API_BASE}/storages/${storage_id}/files/share?path=${safePath}&is_folder=${is_folder}`,
		{
			method: 'delete',
			headers: { Authorization: getAuthToken() },
		}
	)

	if (response.status === 401) {
		handleUnauthorized()
	}

	if (response.status === 404) {
		return
	}

	if (!response.ok) {
		throw new Error(await response.text())
	}
}

/**
 * @typedef {Object} ShareInfo
 * @property {string} id
 * @property {string} path
 * @property {boolean} is_folder
 * @property {string} name
 */

/**
 * @param {string} share_id
 * @returns {Promise<ShareInfo>}
 */
const getShare = async (share_id) => {
	return await apiRequest(`/shares/${share_id}`, 'get')
}

/**
 * @param {string} share_id
 * @returns {Promise<FSElement[]>}
 */
const listSharedFolder = async (share_id) => {
	return await apiRequest(`/shares/${share_id}/tree`, 'get')
}

/**
 * @param {string} share_id
 * @returns {Promise<Blob>}
 */
const downloadShared = async (share_id) => {
	const response = await apiRequest(
		`/shares/${share_id}/download`,
		'get',
		undefined,
		undefined,
		true
	)

	return await response.blob()
}

/**
 * @param {string} share_id
 * @returns {Promise<Blob>}
 */
const downloadSharedFolder = async (share_id) => {
	const response = await apiRequest(
		`/shares/${share_id}/download_folder`,
		'get',
		undefined,
		undefined,
		true
	)

	return await response.blob()
}

/////////////////////////////////////////////////////////////
////  API
/////////////////////////////////////////////////////////////

const API = {
	users: {
		register,
	},
	auth: {
		login,
		telegramLogin,
	},
	storages: {
		createStorage,
		listStorages,
		getStorage,
	},
	access: {
		grantAccess,
		listUsersWithAccess,
		restrictAccess,
	},
	storageWorkers: {
		createStorageWorker,
		listStorageWorkers,
	},
	files: {
		createFolder,
		uploadFile,
		uploadFileChunked,
		uploadFileTo,
		getFSLayer,
		download,
		downloadFolder,
		deleteFile,
		createShare,
		getShareByPath,
		deleteShareByPath,
	},
	shares: {
		getShare,
		listSharedFolder,
		downloadShared,
		downloadSharedFolder,
	},
}

const getAuthToken = () => {
	const [store, _setStore] = createLocalStore()
	return `Bearer ${store.access_token}`
}

export default API
