import { SVGAttributes } from "react";

function Icon({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: SVGAttributes<SVGElement>["className"];
}) {
	return (
		<svg
			data-encore-id="icon"
			role="img"
			aria-hidden="true"
			className={className}
			viewBox="0 0 16 16">
			{children}
		</svg>
	);
}
export function PlayIcon() {
	return (
		<Icon>
			<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
		</Icon>
	);
}
export function PauseIcon() {
	return (
		<Icon>
			<path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path>
		</Icon>
	);
}

export function NextIcon() {
	return (
		<Icon>
			<path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path>
		</Icon>
	);
}
export function PrevIcon() {
	return (
		<Icon>
			<path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"></path>
		</Icon>
	);
}

export function Queue() {
	return (
		<Icon className="h-4 mx-2">
			<path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5zm2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2h-9z"></path>
		</Icon>
	);
}

export function LyricsIcon() {
	return (
		<Icon className="h-4 mx-2">
			<path d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z"></path>
		</Icon>
	);
}

export function Shuffle() {
	return (
		<Icon>
			<path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path>
			<path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path>
		</Icon>
	);
}
export function Repeat() {
	return (
		<Icon>
			<path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path>
		</Icon>
	);
}
export function RepeatOne() {
	return (
		<Icon>
			<path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5ZM12.25 2.5a2.25 2.25 0 0 1 2.25 2.25v5A2.25 2.25 0 0 1 12.25 12H9.81l1.018-1.018a.75.75 0 0 0-1.06-1.06L6.939 12.75l2.829 2.828a.75.75 0 1 0 1.06-1.06L9.811 13.5h2.439A3.75 3.75 0 0 0 16 9.75v-5A3.75 3.75 0 0 0 12.25 1h-.75v1.5h.75Z"></path>
			<path d="m8 1.85.77.694H6.095V1.488c.697-.051 1.2-.18 1.507-.385.316-.205.51-.51.583-.913h1.32V8H8V1.85Z"></path>
			<path d="M8.77 2.544 8 1.85v.693h.77Z"></path>
		</Icon>
	);
}

export function AddToPlaylist() {
	return (
		<Icon className="h-6">
			<path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
			<path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75z"></path>
		</Icon>
	);
}
export function LeftArrow() {
	return (
		<Icon className="w-4 m-2 fill-white">
			<path d="M8.81 1A.749.749 0 0 0 7.53.47L0 7.99l7.53 7.521a.75.75 0 0 0 1.234-.815.75.75 0 0 0-.174-.243L2.87 8.74h12.38a.75.75 0 1 0 0-1.498H2.87l5.72-5.713c.14-.14.22-.331.22-.53z"></path>
		</Icon>
	);
}

export function Saved({ className }: { className?: SVGAttributes<SVGElement>["className"] }) {
	return (
		<Icon className={`${className} fill-primarySpotify`}>
			<path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z"></path>
		</Icon>
	);
}
export function Pinned() {
	return (
		<Icon className="h-4 m-2 fill-primarySpotify">
			<title>Pinned</title>
			<path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337L8.822.797z"></path>
		</Icon>
	);
}
export function Explicit() {
	return (
		<span className="size-4 inline-flex justify-center items-center py-[3px] px-[5px] bg-[rgba(255,255,255,.6)] rounded-sm text-[9px] text-black mx-[3px]">
			E
		</span>
	);
}
export function Close() {
	return (
		<Icon className="fill-white size-7">
			<path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06Z"></path>
		</Icon>
	);
}

export function Devices({ size }: { size?: number }) {
	return (
		<Icon className={`h-4 mr-1`}>
			<path d="M14.5 8a6.468 6.468 0 0 0-1.3-3.9l1.2-.9C15.405 4.537 16 6.2 16 8c0 1.8-.595 3.463-1.6 4.8l-1.2-.9A6.468 6.468 0 0 0 14.5 8zM8 1.5a6.5 6.5 0 1 0 3.25 12.13.75.75 0 1 1 .75 1.3 8 8 0 1 1 0-13.86.75.75 0 1 1-.75 1.298A6.467 6.467 0 0 0 8 1.5z"></path>
			<path d="M11.259 8c0-.676-.228-1.296-.611-1.791l1.187-.918c.579.749.924 1.69.924 2.709a4.41 4.41 0 0 1-.925 2.709l-1.186-.918c.383-.495.61-1.115.61-1.791zM8.75 4.115l-4.139 2.39a1.727 1.727 0 0 0 0 2.99l4.139 2.39v-7.77z"></path>
		</Icon>
	);
}

export function DeviceIcon({
	deviceType,
	className,
}: {
	deviceType: string;
	className?: SVGAttributes<SVGElement>["className"];
}) {
	switch (deviceType) {
		case "COMPUTER":
			return (
				<svg
					viewBox="0 0 24 24"
					className={"size-5 " + className}>
					<path d="M0 21a1 1 0 0 1 1-1h22a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1zM3 5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5zm3-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6z"></path>
				</svg>
			);

		case "SMARTPHONE":
			return (
				<svg
					viewBox="0 0 24 24"
					className={"size-5 " + className}>
					<path d="M5 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5zm3-1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8z"></path>
					<path d="M13.25 16.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z"></path>
				</svg>
			);
		case "SMARTWATCH":
			return (
				<svg
					viewBox="0 0 24 24"
					className={"size-5 " + className}>
					<path d="M6.916 1.584A2 2 0 0 1 8.873 0h6.4a2 2 0 0 1 1.957 1.584l.761 3.584A3.001 3.001 0 0 1 20 8v8a3 3 0 0 1-2.009 2.832l-.761 3.584A2 2 0 0 1 15.273 24h-6.4a2 2 0 0 1-1.957-1.584l-.75-3.534A3.001 3.001 0 0 1 4 16V8c0-1.367.915-2.52 2.165-2.882l.751-3.534zM8.235 5h7.676l-.637-3H8.873l-.638 3zm0 14 .638 3h6.4l.638-3H8.235zM7 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H7z"></path>
				</svg>
			);

		default:
			return <Devices />;
	}
}

export function DownArrow() {
	return (
		<svg
			className={"size-5 fill-white mx-5"}
			viewBox="0 0 24 24">
			<path d="M2.793 8.043a1 1 0 0 1 1.414 0L12 15.836l7.793-7.793a1 1 0 1 1 1.414 1.414L12 18.664 2.793 9.457a1 1 0 0 1 0-1.414z"></path>
		</svg>
	);
}

export function MoreOptions() {
	return (
		<svg
			viewBox="0 0 16 16"
			className={"size-5 fill-white mx-5"}>
			<path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
		</svg>
	);
}
