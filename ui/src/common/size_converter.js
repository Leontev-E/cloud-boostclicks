const units = ['B', 'KB', 'MB', 'GB', 'TB']

/**
 *
 * @param {number} size
 * @returns {string}
 */
export const convertSize = (size) => {
	let l = 0
	let n = size

	while (n >= 1000 && l < units.length - 1 && ++l) {
		n = n / 1000
	}

	return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`
}
