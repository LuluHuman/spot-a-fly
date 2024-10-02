import { CSSProperties, useState } from "react";

export function Timestamp({ ms }: { ms: number }) {
	const curProgressSec = Math.floor((ms % 60000) / 1000);
	return (
		<span>
			{Math.floor(ms / 60000)}:
			{curProgressSec < 10 ? "0" + curProgressSec.toString() : curProgressSec}
		</span>
	);
}

export function ButtonWithFetchState({
	className,
	clickAction,
	style,
	children,
	setErrToast,
}: {
	className: string;
	clickAction?: () => Promise<unknown> | undefined;
	style?: CSSProperties;
	children: React.ReactNode;
	setErrToast?: any;
}) {
	const [opacityClass, setOpacityClass] = useState<boolean>(false);
	return (
		<button
			className={className + (opacityClass ? " isLoading" : "")}
			style={style}
			onClick={() => {
				if (!clickAction) return;
				setOpacityClass(true);
				const click = clickAction();
				if (!click?.then) return;
				click.then((e: any) => {
					console.log(e, e && e.err);
					setOpacityClass(false);
					if (e && setErrToast)
						setErrToast("Error: " + e?.error?.message || JSON.stringify(e));
				});
			}}>
			{children}
		</button>
	);
}
