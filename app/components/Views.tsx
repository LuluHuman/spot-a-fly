import Image from "next/image";
import { EditablePlaylist, Lyrics, NextTrack, SongState, SongStateExtra } from "../lib/types";
import { Explicit, LeftArrow, Pinned, Saved } from "./icons";
import { Spotify, URIto } from "../lib/api";
import { ButtonWithFetchState } from "./components";
import { CSSProperties, useRef } from "react";

const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";
const roundGrad = (p: number) => (p > 100 ? 100 : p < 0 ? 0 : Number.isNaN(p) ? 100 : p);

export function AddToView({
	addToModal,
	setAddToModal,
	songUri,
	SpotifyClient,
	setToast,
	modalHistory,
}: {
	addToModal: EditablePlaylist["data"]["me"]["editablePlaylists"];
	setAddToModal: any;
	songUri?: string;
	SpotifyClient?: Spotify;
	setToast: any;
	modalHistory: any;
}) {
	return (
		<div className="fixed w-dvw h-dvh bg-neutral-900 z-10 px-4">
			<div className="flex items-center py-4 justify-between">
				<button
					className="px-3"
					onClick={() => {
						modalHistory.current.pop();
						const modal = modalHistory.current[modalHistory.current.length - 1];
						setAddToModal(modal);
					}}>
					<LeftArrow />
				</button>
				<span>Add to playlist</span>
				<div className="px-2 w-4"></div>
			</div>
			<div>
				{addToModal?.items.map((item) => {
					const images = item.item.data.images;
					const image = item.item.data.image;
					const image_src = image ? image.sources[0] : undefined;
					const images_src = images ? images.items[0].sources[0] : undefined;
					const src = image_src?.url || images_src?.url;
					return (
						<button
							key={item.item._uri}
							className="flex justify-between p-2 w-full"
							onClick={() => {
								if (!SpotifyClient) return;
								if (item.item.data.__typename == "Folder") {
									const folderUri = item.item._uri;
									if (!folderUri || !songUri || !SpotifyClient) return;
									SpotifyClient.getEditablePlaylists([songUri], folderUri).then(
										(data) => {
											const playlists = data as EditablePlaylist;

											modalHistory.current.push(
												playlists.data.me.editablePlaylists
											);
											const modal =
												modalHistory.current[
													modalHistory.current.length - 1
												];
											setAddToModal(modal);
										}
									);
								} else {
									if (!songUri) return;
									const addingToLiked =
										item.item.data.uri == "spotify:collection:tracks";

									const addMethod = addingToLiked
										? SpotifyClient.saveTrack
										: SpotifyClient.appendToPlaylist;
									const removeMethod = addingToLiked
										? SpotifyClient.removeSavedTrack
										: SpotifyClient.removeFromPlaylist;

									const method = (item.curates ? removeMethod : addMethod).bind(
										SpotifyClient
									);

									if (addingToLiked) {
										method(songUri, "").then(() => setAddToModal(undefined));
										setToast(
											`${
												item.curates ? "Removed from" : "Added to"
											} Liked Songs`
										);
									} else {
										method(URIto.id(item.item.data.uri), songUri).then(() =>
											setAddToModal(undefined)
										);

										setToast(
											`${item.curates ? "Removed from" : "Added to"} playlist`
										);
									}
								}
							}}>
							<div className="flex items-center">
								<div className="size-12 mr-2 rounded-lg bg-neutral-700 flex items-center justify-center">
									{src ? (
										<Image
											className="size-full"
											alt="alb-img"
											width={64}
											height={64}
											priority={false}
											unoptimized={true}
											src={src}
										/>
									) : (
										<svg
											className="size-4 fill-neutral-400"
											viewBox="0 0 16 16">
											<path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v11.5C0 15.216.784 16 1.75 16h12.5A1.75 1.75 0 0 0 16 14.25v-9.5A1.75 1.75 0 0 0 14.25 3H7.82l-.65-1.125A1.75 1.75 0 0 0 5.655 1H1.75zM1.5 2.75a.25.25 0 0 1 .25-.25h3.905a.25.25 0 0 1 .216.125L6.954 4.5h7.296a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75z"></path>
										</svg>
									)}
								</div>
								<span>{item.item.data.name}</span>
							</div>
							{item.item.data.__typename == "Folder" ? (
								<></>
							) : (
								<div className="flex items-center">
									{item.pinned ? <Pinned /> : <></>}
									{item.curates ? (
										<Saved className="h-4" />
									) : (
										<span className="size-4 border border-neutral-500 rounded-full" />
									)}
								</div>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function LyricView({
	lyrics: lyrcs,
	curProgressMs,
	contentType,
	lyricSource,
	SpotifyClient,
	nextSong,
}: {
	lyrics: Lyrics[];
	curProgressMs: number;
	contentType?: string;
	lyricSource: string;
	SpotifyClient?: Spotify;
	nextSong?: NextTrack;
}) {
	const Colors = useRef<any>();
	if (typeof lyrcs == "string") return <>{lyrcs}</>;
	SpotifyClient?.getColors(nextSong?.albumOfTrack.coverArt.sources[0].url).then((x) => {
		Colors.current = x.data?.extractedColors[0];
	});

	return (
		<>
			{lyrcs.map((x) =>
				parseLines(
					x,
					curProgressMs,
					contentType as "Line" | "Syllable" | "Static" | "queue" | undefined,
					SpotifyClient
				)
			)}
			<span className="text-sm opacity-25 whitespace-break-spaces">
				{"Lyrics provided by " + lyricSource}
			</span>
			<div
				className="rounded-lg bg-[var(--light-color)] px-2"
				style={
					{
						"--light-color": Colors.current?.colorLight?.hex,
					} as CSSProperties
				}>
				{nextSong ? (
					<SongCard
						title={nextSong?.name}
						artist={nextSong?.artists.items.map((a) => a.profile.name).join(" ")}
						isExplicit={nextSong.contentRating.label == "EXPLICIT"}
						albImg={nextSong?.albumOfTrack.coverArt.sources[0].url || blank}
					/>
				) : (
					<></>
				)}
			</div>
		</>
	);
}

function parseLines(
	{
		i,
		isInstrumental,
		isOppositeAligned,
		isBackground,
		msStart,
		msEnd,
		element: rawElement,
		children,
	}: Lyrics,
	curMs: number,
	showing: "Line" | "Syllable" | "Static" | "queue" | undefined,
	SpotifyClient?: Spotify
) {
	var element: React.JSX.Element | React.JSX.Element[] = rawElement;

	const inRange = curMs >= msStart && !(curMs >= msEnd);
	const lineType = isInstrumental ? "instrumental " : "lyrLine ";
	const lineAignment = isOppositeAligned ? "text-right " : "text-left";

	var lineActive = "";
	var gradientProgress = 0;

	if (showing == "Syllable" && children) {
		if (inRange) lineActive = " lineActive";
		element = children.map(({ msStart, msEnd, element: elementT }) => {
			const inSylRange = curMs >= msStart;

			const ad = !inSylRange ? "sylInactive" : "sylActive";
			const bgClass = isBackground ? "bg " : "";
			const startOffset = curMs - msStart;
			const endOffset = msEnd - msStart;
			const p = (startOffset / endOffset) * 100;
			const css = {
				"--gradient-progress": `${roundGrad(p)}%`,
			};
			return (
				<span
					className={bgClass + ad}
					style={css as React.CSSProperties}
					key={`${msStart} - ${msEnd}: ${elementT.toString()}`}>
					{elementT}
				</span>
			);
		});
	}
	if (inRange) Active();
	function Active() {
		const actveStart = curMs - msStart;
		const activeEnd = msEnd - msStart;
		if (isInstrumental) {
			const timeLeft = msEnd - curMs;

			const subtract = ((activeEnd - 1000) % 2) + 1000;
			const durInsPer = actveStart / (activeEnd - subtract);

			const insDots = [0, 1, 2].map((i) => {
				const startAt = i / 3;
				const alphaSigma = durInsPer >= startAt ? durInsPer : 0;
				const css = { "--alpha": `${alphaSigma}` };
				return (
					<span
						key={i}
						style={css as React.CSSProperties}
					/>
				);
			});
			const animate = timeLeft < subtract ? "animation-end" : "animation";
			const ins = <div className={`instrumentalText animation ${animate}`}>{insDots}</div>;
			element = ins;
			lineActive = " lineActive";
		}
		if (showing == "Line") {
			const durLyrPercentage = roundGrad((actveStart / activeEnd) * 100);
			gradientProgress = durLyrPercentage;
			lineActive = " lineActive lineAnimate";
			return;
		}
	}
	return (
		<button
			className={`${lineType + lineAignment + lineActive}`}
			style={
				gradientProgress > 0
					? ({
							"--gradient-progress": `${gradientProgress}%`,
					  } as React.CSSProperties)
					: undefined
			}
			ref={(ref) => {
				if (msStart - curMs < 100 && msStart - curMs > 0) {
					ref?.scrollIntoView({
						block: "center",
						behavior: "smooth",
					});
				}
			}}
			onClick={() => SpotifyClient?.SeekTo(Math.ceil(msStart))}
			key={showing == "Static" ? i : `${msStart} - ${msEnd}: ${element.toString()}`}>
			{element}
		</button>
	);
}

function QueueView({
	curInfo,
	curInfoExtra,
	SpotifyClient,
}: {
	curInfo?: SongState;
	curInfoExtra?: SongStateExtra;
	SpotifyClient?: Spotify;
}) {
	if (!curInfo || !curInfoExtra || !curInfoExtra.queue) return <></>;

	const NowPlaying = [
		<div
			key={"title1"}
			className="font-bold">
			Now playing:
		</div>,
		<SongCard
			albImg={curInfo.image}
			title={curInfo.title}
			artist={curInfo.artist}
			isExplicit={curInfo.isExplicit}
			key={"np"}
		/>,
	];

	const ProviderContext = curInfoExtra.queue.filter(({ provider }) => provider !== "queue");
	const ProviderQueue = curInfoExtra.queue.filter(({ provider }) => provider == "queue");
	const section = (q: NextTrack[], label: string) =>
		q.length == 0
			? []
			: [
					<div
						key={label}
						className="font-bold">
						{label}
					</div>,
					...q.map((queueItem, i) => {
						const albImg64 = queueItem.albumOfTrack.coverArt.sources.filter(
							(x) => x.height == 64
						)[0];
						return (
							<SongCard
								albImg={albImg64.url}
								title={queueItem.name}
								artist={queueItem.artists.items
									.map((a) => a.profile.name)
									.join(", ")}
								isExplicit={queueItem.contentRating.label == "EXPLICIT"}
								key={label + "-" + i}
								clickAction={() => {
									if (
										queueItem.uri.startsWith("spotify:track") ||
										queueItem.uri.startsWith("spotify:local")
									) {
										return SpotifyClient?.SkipTo({
											active_device_id: curInfo.deviceId,
											uri: queueItem.uri,
											uid: queueItem.uid,
										});
									}
								}}
							/>
						);
					}),
			  ];

	return [
		...NowPlaying,
		...section(ProviderQueue, "Next in queue"),
		...section(ProviderContext, "Next from: " + curInfoExtra.context.name),
	];
}

function SongCard({
	albImg,
	title,
	artist,
	isExplicit,
	clickAction,
}: {
	albImg: string;
	title: string;
	artist: string;
	isExplicit: boolean;
	clickAction?: () => Promise<unknown> | undefined;
}) {
	return (
		<ButtonWithFetchState
			className={"queueItem w-full transition-all"}
			clickAction={clickAction}>
			<Image
				alt="queue"
				width={64}
				height={64}
				unoptimized={true}
				src={albImg}
			/>
			<div>
				<span className="text-base text-left">{title}</span>
				<span className="flex items-center opacity-50 text-sm text-left">
					{isExplicit ? <Explicit /> : <></>}
					{artist}
				</span>
			</div>
		</ButtonWithFetchState>
	);
}

export function View({
	SpotifyClient,
	viewType,
	curInfo,
	curInfoExtra,
	lyrics,
	lyricText,
	lyrSource,
	lyricType,
	curProgressMs,
}: {
	SpotifyClient?: Spotify;
	viewType: number | undefined;
	curInfo?: SongState;
	curInfoExtra?: SongStateExtra;
	lyrics: Lyrics[] | undefined;
	lyricText?: string | React.JSX.Element | React.JSX.Element[] | undefined;
	lyrSource: string;
	lyricType: "Line" | "Syllable" | "Static" | undefined;
	curProgressMs: number;
}) {
	const defaultView = (
		<div className="flex justify-center items-center h-full w-full px-6">
			<Image
				className="w-auto rounded-xl"
				alt="alb-img"
				width={0}
				height={0}
				priority={false}
				unoptimized={true}
				src={curInfo?.image || blank}
			/>
		</div>
	);
	const lyricsView = lyrics ? (
		<LyricView
			lyrics={lyrics}
			lyricSource={lyrSource}
			contentType={lyricType}
			curProgressMs={curProgressMs}
			SpotifyClient={SpotifyClient}
			nextSong={curInfoExtra?.queue[0]}
		/>
	) : (
		lyricText
	);

	const queueView = (
		<QueueView
			curInfo={curInfo}
			curInfoExtra={curInfoExtra}
			SpotifyClient={SpotifyClient}
		/>
	);

	return (
		<>
			{viewType === undefined ? defaultView : <></>}
			{viewType == 0 ? (
				lyricsView ? (
					<div className="extraContainer h-full">
						<div className="extra p-3">{lyricsView}</div>
					</div>
				) : (
					defaultView
				)
			) : (
				<></>
			)}
			{viewType == 1 ? <div className="px-3">{queueView}</div> : <></>}
		</>
	);
}
