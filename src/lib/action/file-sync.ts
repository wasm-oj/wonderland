export function sync(node: HTMLInputElement, update: (value: string) => void) {
	const handler = () => {
		const file = node.files?.[0];
		if (file && file.size < 32 * 1024) {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					update(reader.result);
				}
			};
			reader.readAsText(file);
		}
	};

	node.addEventListener("change", handler);

	return {
		destroy() {
			node.removeEventListener("change", handler);
		},
	};
}
