export function completion(items: number, completed: number) {
	return `${((completed / items) * 100).toFixed(0)}%`
}
