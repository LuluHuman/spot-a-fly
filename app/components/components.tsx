import Image from "next/image";
import { CSSProperties, useState } from "react";
import { Explicit } from "./icons";

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
	disabled,
	className,
	clickAction,
	style,
	children,
	setErrToast,
}: {
	disabled?: boolean;
	className: string;
	clickAction?: () => Promise<unknown> | undefined;
	style?: CSSProperties;
	children: React.ReactNode;
	setErrToast?: any;
}) {
	const [opacityClass, setOpacityClass] = useState<boolean>(false);
	return (
		<button
			disabled={disabled}
			className={
				className + (opacityClass ? " isLoading" : "") + (disabled ? " isLoading" : "")
			}
			style={style}
			onClick={() => {
				if (!clickAction) return;
				setOpacityClass(true);
				const click = clickAction();
				if (!click?.then) return;
				click.then((e: any) => {
					setOpacityClass(false);
					if (e && setErrToast)
						setErrToast("Error: " + e?.error?.message || JSON.stringify(e));
				});
			}}>
			{children}
		</button>
	);
}
export function SongCard({
	albImg,
	title,
	artist,
	isExplicit,
	clickAction,
	className,
}: {
	albImg: string;
	title: string;
	artist: string;
	isExplicit: boolean;
	clickAction?: () => Promise<unknown> | undefined;
	className?: string;
}) {
	return (
		<ButtonWithFetchState
			className={"queueItem text-white w-full transition-all rounded-lg font-bold flex py-2"}
			clickAction={clickAction}>
			<Image
				className="rounded-md size-12 mr-2 bg-[#282828]"
				alt="queue"
				width={64}
				height={64}
				unoptimized={true}
				src={albImg}
			/>
			<div className="flex flex-col justify-center text-nowrap text-ellipsis overflow-hidden">
				<span className="text-base text-left font-mediumz">{title}</span>
				<span className="flex items-center opacity-50 text-sm text-left">
					{isExplicit ? <Explicit /> : <></>}
					{artist}
				</span>
			</div>
		</ButtonWithFetchState>
	);
}
