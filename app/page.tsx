"use client";

import "./style.css";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";

import {
	DeviceIcon,
	Devices,
	DownArrow,
	Explicit,
	LyricsIcon,
	MoreOptions,
	PauseIcon,
	PlayIcon,
	Queue,
} from "./components/icons";
import OverflowText from "./components/OverflowText";
import { ButtonWithFetchState, Timestamp } from "./components/components";
import { DeviceCurrenlyPlaying, Buttons, AddToButton } from "./components/Buttons";
import View from "./components/Views/Views";
import AddToView from "./components/Views/AddTo";
import DeviceSelector from "./components/Views/Devices";

import { Musixmatch, Spotify, URIto } from "./lib/api";
import {
	PlayerState,
	SpotifyWebhook,
	SongStateExtra,
	Lyrics,
	EditablePlaylist,
	SongState,
} from "./lib/types";
import { findLyrics } from "./lib/lyricFinder";
import { collectState, collectStateExtra } from "./lib/collectState";
import { useSearchParams } from "next/navigation";
const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";
const blankState = {
	canvasUrl: undefined,
	isExplicit: false,
	isSaved: false,
	context: { header: "", name: "" },
	title: "...",
	artist: "",
	image: "",
	duration: 0,
	queue: [],
	options: { repeating_context: false, repeating_track: false, shuffling_context: false },
	uris: { album: "", song: "" },
};

export default function Home() {
	const searchParams = useSearchParams();
	const v = searchParams.get("viewId");
	const lastV = useRef(v);

	///

	const [user, setUser] = useState<any>();
	const [libraryItems, setLibraryItems] = useState<any>();

	//! Caching
	const cache = useRef<{ [key: string]: any }>({});
	const lastTrackUri = useRef("");

	//! 3rd Party APIs
	const [SpotifyClient, setSpotifyClient] = useState<Spotify>();
	const mxmClient = useRef<Musixmatch>();

	//! Song info states lidat
	const [state, setPlayerState] = useState<SpotifyWebhook["payloads"][0]["cluster"]>();
	const [curInfoExtra, setInfoExtra] = useState<SongStateExtra>(blankState);
	const [curInfo, setInfo] = useState<SongState>(blankState);

	//! Modal History, Info
	const modalHistory = useRef([]);
	const [addToModal, setAddToModal] =
		useState<EditablePlaylist["data"]["me"]["editablePlaylists"]>();

	//! View related things
	const [ShowDevices, setDevicesOverlay] = useState<boolean>(false);
	const [hidePlayer, setPlayerHidden] = useState<boolean>(false);
	const [viewType, setViewType] = useState<undefined | number>(v ? parseInt(v) : undefined);
	const [lyricText, setLyricsText] = useState<React.JSX.Element | React.JSX.Element[] | string>();
	const [lyrcs, setLyrics] = useState<Lyrics[]>();
	const lyricType = useRef<"Line" | "Syllable" | "Static">();
	const lyrSource = useRef("");

	//! Inform the user
	const [err, setMessage] = useState<string | undefined>();
	const [toast, setToast] = useState<string | undefined>();

	//! Timekeeper
	const [curProgressMs, setCurProgressMs] = useState<number>(0);
	const curDurationMs = useRef<number>(0);
	const [isPaused, setPaused] = useState<boolean>(true);
	const currentInveral = useRef<NodeJS.Timeout>();

	if (v !== lastV.current) {
		lastV.current = v;
		setViewType(v ? parseInt(v) : undefined);
	}

	useEffect(() => setSpotifyClient(new Spotify()), []);
	useEffect(() => {
		if (!SpotifyClient) return;

		mxmClient.current = new Musixmatch();

		setMessage("Connecting to Webhook...");
		SpotifyClient.ready = () => {
			if (!SpotifyClient.session.accessToken)
				return setMessage("Error: No Spotify Access Token");
			if (SpotifyClient.session.isAnonymous) {
				const token = prompt("sp_dc Access Token:");
				fetch("/api/session", {
					method: "POST",
					body: JSON.stringify({ session: token }),
				}).then(() => (window.location.href = window.location.href));
				return;
			}
			SpotifyClient.getMe().then((me) => {
				setUser(me);
			});
			SpotifyClient.getLibrary().then((data) => {
				const libraryV3items = (data as any).data.me.libraryV3.items;
				setLibraryItems(libraryV3items);
			});
			setMessage(undefined);
			const wsDealer = "dealer.spotify.com";
			const wsUrl = `wss://${wsDealer}/?access_token=${SpotifyClient.session.accessToken}`;
			const spWs = new WebSocket(wsUrl);
			spWs.onmessage = (event) => {
				const data = JSON.parse(event.data) as SpotifyWebhook;
				if (!data.headers) return;

				const stfConnectionId = data.headers["Spotify-Connection-Id"];
				if (!stfConnectionId) return setPlayerState(data.payloads[0].cluster);

				SpotifyClient.connectWs(stfConnectionId).then((state) => {
					console.info("Successfully connect to websocket");
					setPlayerState(state);
				});
			};
		};
	}, [SpotifyClient]);

	useEffect(() => {
		if (currentInveral.current) clearInterval(currentInveral.current);
		if (!SpotifyClient) return;

		const player_state = (state?.player_state || state) as PlayerState;
		if (!player_state || !state || !player_state.track) return;

		if (player_state.track.metadata["media.manifest"]) {
			const input = atob(player_state.track.metadata["media.manifest"]);
			const speakTagPattern = /<speak[^>]*>([\s\S]*?)<\/speak>/;
			const match = input.match(speakTagPattern);
			setLyrics(undefined);
			setLyricsText(
				match ? match[1].replace(/<entity[^>]*>(.*?)<\/entity>/g, "$1") : undefined
			);
			return;
		}

		if (Object.keys(cache.current).length > 5) cache.current = {};
		console.info("State: ", state);
		setPaused(player_state.is_paused);

		const trackUri = player_state.track.uri;
		const trackId = URIto.id(trackUri);

		const songDuration = parseInt(player_state.duration);
		curDurationMs.current = songDuration;

		const timestamp = parseInt(player_state.timestamp);
		const latency = performance.timeOrigin + performance.now() - timestamp;

		const ms = parseInt(player_state.position_as_of_timestamp);
		const startTimestamp = timestamp - ms + (latency > 1000 ? 0 : latency);

		setCurProgressMs(ms);

		const _msStep = 50;
		const inveral = setInterval(() => {
			if (currentInveral.current !== inveral) {
				clearInterval(currentInveral.current);
				currentInveral.current = inveral;
			}
			if (player_state.is_paused || !state.active_device_id) return clearInterval(inveral);
			const ms = performance.timeOrigin + performance.now() - startTimestamp;
			setCurProgressMs(ms);
		}, _msStep);

		if (lastTrackUri.current == trackUri) {
			collectState(trackId, SpotifyClient, state).then((changedState) => {
				console.info("Changed info: ", changedState);
				setInfo(changedState);
			});
			collectStateExtra(SpotifyClient, state).then((changedState) => {
				console.info("Changed info(Promises): ", changedState);
				setInfoExtra(changedState);
			});
			return;
		}
		lastTrackUri.current = trackUri;

		setLyricsText(undefined);
		setLyrics([]);

		SpotifyClient.getColors(player_state.track.metadata.image_xlarge_url).then(
			(fetchColours: any) => {
				const Colors = fetchColours.data ? fetchColours.data.extractedColors[0] : undefined;
				const [dark, light] = Colors
					? [Colors.colorDark.hex, Colors.colorLight.hex]
					: ["", ""];
				document.body.style.setProperty("--dark-color", dark);
				document.body.style.setProperty("--light-color", light);
			}
		);
		collectState(trackId, SpotifyClient, state).then((changedState: SongState) => {
			console.info("Info(No promises): ", changedState);
			document.title = `${changedState?.title} • ${changedState.artist}`;

			setInfo(changedState);
			findLyrics(
				{ cache, SpotifyClient, mxmClient: mxmClient?.current },
				{
					uri: changedState.uris.song,
					title: changedState.title,
					artist: changedState.artist,
				}
			).then(({ source, type, data, copyright }) => {
				if (data == "not-found") {
					setLyrics(undefined);
					setLyricsText(undefined);
					return;
				}

				lyricType.current = type;
				const cpyAttribute = copyright ? "\n" + copyright : "";
				lyrSource.current = source + cpyAttribute;
				setLyrics(data);
			});
		});
		collectStateExtra(SpotifyClient, state).then((changedState: SongStateExtra) => {
			console.info("Info(Promises): ", changedState);
			setInfoExtra(changedState);

			if (!changedState?.queue[0]) return;
			const { uri, name, artists } = changedState?.queue[0];
			findLyrics(
				{ cache, SpotifyClient, mxmClient: mxmClient?.current },
				{
					uri: uri,
					title: name,
					artist: artists.items.map((a) => a.profile.name).join(" "),
				}
			);
		});
		return () => clearInterval(currentInveral.current);
	}, [SpotifyClient, state]);

	const buttonClick = (viewId: number) => {
		setViewType((x) => {
			const setView = x == viewId ? undefined : viewId;
			history.pushState(null, "", setView === undefined ? "/" : "/?viewId=" + setView);
			return setView;
		});
	};
	return (
		<>
			{addToModal ? (
				<AddToView
					addToModal={addToModal}
					setAddToModal={setAddToModal}
					songUri={curInfo?.uris.song}
					SpotifyClient={SpotifyClient}
					setToast={setToast}
					modalHistory={modalHistory}
					isPaused={isPaused}
				/>
			) : (
				<></>
			)}

			<DeviceSelector
				ShowDevices={ShowDevices}
				SpotifyClient={SpotifyClient}
				curInfo={curInfo}
				setDevicesOverlay={setDevicesOverlay}
			/>
			{hidePlayer ? (
				<div className="flex flex-col items-center w-dvw h-dvh overflow-scroll">
					<h1 className="py-2 text-xl font-bold">
						Logged in as {user?.display_name || "Spooky Ghost"}
					</h1>
					<div className="flex flex-wrap justify-center">
						{libraryItems?.map((i: any) => {
							const item = i.item.data;
							const type = item.__typename;
							const image = (() => {
								switch (type) {
									case "Album":
										return item.coverArt?.sources[0].url || item.Images;

									case "PseudoPlaylist":
										return item.image?.sources[1].url;
									case "Playlist":
										return item.images?.items[0].sources[0].url;
									case "Artist":
										return item.visuals?.avatarImage.sources[0].url;
									case "Folder":
										return blank;
									default:
										break;
								}
							})();
							return (
								<a
									key={item.uri}
									href={item.uri}>
									<Image
										className="size-20 m-2 rounded-md aspect-square bg-[#282828] border-none block"
										alt="coverArt"
										width={0}
										height={0}
										priority={false}
										unoptimized={true}
										src={image || blank}
									/>
									<span className="w-20 inline-block overflow-hidden text-nowrap text-xs">
										{item.name || item.profile.name}
									</span>
								</a>
							);
						})}
					</div>
					<div className="fixed bottom-0 w-full p-2">
						<div className="flex flex-col bg-[var(--dark-color)] rounded-md text-left w-full h-13 overflow-hidden cursor-pointer">
							<div className="flex items-center p-2 pb-1 w-full">
								<Image
									className="size-10 mr-2 rounded-md aspect-square bg-[#282828] border-none block"
									alt="alb-img"
									width={64}
									height={64}
									priority={false}
									unoptimized={true}
									src={curInfo?.image || blank}
								/>
								<div
									className="flex flex-col overflow-hidden"
									style={{ width: "inherit" }}
									onClick={() => setPlayerHidden(false)}>
									<OverflowText className="text-xs w-full font-bold text-nowrap">
										{curInfo.title + " • " + curInfo.artist}
									</OverflowText>
									<span className="text-sm text-primarySpotify *:fill-primarySpotify flex items-center">
										<Devices />
										{curInfo?.deviceText}
									</span>
								</div>
								<button
									className="mx-3 flex items-center *:fill-primarySpotify"
									onClick={() => setDevicesOverlay(true)}>
									<DeviceIcon
										className="h-full size-6"
										deviceType={
											curInfo?.deviceId && curInfo?.devices
												? curInfo?.devices[curInfo.deviceId].device_type
												: ""
										}
									/>
								</button>

								<AddToButton
									className="fill-white mx-3"
									SpotifyClient={SpotifyClient}
									curInfo={curInfo}
									curInfoExtra={curInfoExtra}
									setAddToModal={setAddToModal}
									modalHistory={modalHistory}
								/>

								<ButtonWithFetchState
									disabled={!curInfo.deviceId}
									setErrToast={setMessage}
									className="size-10 mx-3 *:fill-white h-full"
									clickAction={() =>
										SpotifyClient?.playback(!isPaused ? "pause" : "play")
									}>
									{isPaused ? <PauseIcon /> : <PlayIcon />}
								</ButtonWithFetchState>
							</div>

							<div className="flex w-full h-1 bg-lightly">
								<div
									className="bg-[white] w-[var(--width)] h-full"
									style={
										{
											"--width": `${
												(curProgressMs / curDurationMs.current) * 100
											}%`,
										} as React.CSSProperties
									}
								/>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className={`overflow-hidden flex flex-col w-dvw h-dvh `}>
					<Backdrop
						curInfo={curInfo}
						curInfoExtra={curInfoExtra}
					/>

					<Context
						curInfo={curInfoExtra}
						setPlayerHidden={setPlayerHidden}
					/>
					<div className="overflow-scroll w-full flex flex-col items-stretch flex-1">
						<View
							SpotifyClient={SpotifyClient}
							viewType={viewType}
							curInfo={curInfo}
							curInfoExtra={curInfoExtra}
							lyrics={lyrcs}
							lyricText={lyricText}
							lyrSource={lyrSource.current}
							lyricType={lyricType.current}
							curProgressMs={curProgressMs}
						/>
					</div>
					<div className="box-shadow flex flex-col w-full h-fit overflow-hidden z-[1] rounded-t-lg px-4">
						<div className="flex items-center justify-between py-3 w-full">
							<SongInfo
								curInfo={curInfo}
								viewType={viewType}
								err={err}
							/>
							<AddToButton
								SpotifyClient={SpotifyClient}
								curInfo={curInfo}
								curInfoExtra={curInfoExtra}
								setAddToModal={setAddToModal}
								modalHistory={modalHistory}
							/>
						</div>
						<Track
							SpotifyClient={SpotifyClient}
							curProgressMs={curProgressMs}
							curDurationMs={curDurationMs.current}
						/>
						<div className="flex justify-center items-center *:mx-1">
							<Buttons
								SpotifyClient={SpotifyClient}
								isPaused={isPaused}
								curInfo={curInfo}
								setErrToast={setToast}
							/>
						</div>
						<div className="my-3 flex items-center justify-between">
							<DeviceCurrenlyPlaying
								curInfo={curInfo}
								setDevicesOverlay={setDevicesOverlay}
							/>
							<div>
								<button
									className={viewType == 0 ? "fill-primarySpotify" : "fill-white"}
									onClick={() => buttonClick(0)}>
									<LyricsIcon />
								</button>
								<button
									className={viewType == 1 ? "fill-primarySpotify" : "fill-white"}
									onClick={() => buttonClick(1)}>
									<Queue />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{toast ? (
				<Toast
					toast={toast}
					setToast={setToast}
				/>
			) : (
				<></>
			)}
		</>
	);
}

function Toast({ toast, setToast }: { toast: string; setToast: any }) {
	if (toast) {
		setTimeout(() => setToast(undefined), 1000);
	}

	return (
		<div className="fixed bottom-0 w-full flex justify-center p-10 z-10 transition ">
			<span className="bg-white text-black p-2 rounded-lg">{toast}</span>
		</div>
	);
}

function Track({
	SpotifyClient,
	curProgressMs,
	curDurationMs,
}: {
	SpotifyClient?: Spotify;
	curProgressMs: number;
	curDurationMs: number;
}) {
	const setElapsedTo = useRef<number>();
	return (
		<div
			onTouchEnd={(event) => {
				setElapsedTo.current = undefined;
				const element = event.target as HTMLDivElement;
				const roundGrad = (p: number) => (p > 1 ? 1 : p < 0 ? 0 : Number.isNaN(p) ? 1 : p);
				const val = roundGrad(
					(event.changedTouches[0].clientX - element.offsetLeft) / element.offsetWidth
				);

				SpotifyClient?.SeekTo(Math.floor(val * curDurationMs));
			}}
			onTouchMove={(event) => {
				const element = event.target as HTMLDivElement;
				const roundGrad = (p: number) => (p > 1 ? 1 : p < 0 ? 0 : Number.isNaN(p) ? 1 : p);
				const val = roundGrad(
					(event.touches[0].clientX - element.offsetLeft) / element.offsetWidth
				);

				setElapsedTo.current = val * 100;
			}}>
			<div
				id="track"
				className="flex w-full h-1 bg-lightly rounded-full">
				<div
					className="bg-[var(--dark-color)] w-[var(--width)] h-full rounded-full"
					style={
						{
							"--width": `${
								setElapsedTo.current || (curProgressMs / curDurationMs) * 100
							}%`,
						} as React.CSSProperties
					}
				/>
				<span className="size-2 bg-[var(--light-color)] inline-block rounded-full relative -top-[1.7px] -left-1"></span>
			</div>
			<div className="flex w-full justify-between *:text-xs">
				<Timestamp ms={curProgressMs} />
				<Timestamp ms={curDurationMs} />
			</div>
		</div>
	);
}

function Backdrop({
	curInfo,
	curInfoExtra,
}: {
	curInfo?: SongState;
	curInfoExtra: SongStateExtra;
}) {
	return curInfoExtra?.canvasUrl || curInfoExtra?.canvasUrl?.endsWith("jpg") ? (
		<div className="absolute -z-[1] h-full top-0 flex justify-center w-full overflow-hidden bg-black">
			<video
				src={curInfoExtra?.canvasUrl}
				loop
				autoPlay
				className="blur-md h-full saturate-200 brightness-50 max-w-none"
			/>
		</div>
	) : (
		<div
			className="-z-[1] size-full max-h-[55%] max-w-[35%] fixed saturate-200 brightness-[0.65] overflow-hidden scale-x-[290%] scale-y-[185%] origin-top-left pointer-events-none"
			style={{
				background: "linear-gradient(var(--light-color), var(--dark-color), black)",
			}}>
			{curInfo && curInfo.image ? (
				["Front", "Back", "BackCenter"].map((classes) => (
					<Image
						alt="bg"
						key={classes}
						className={
							classes + " blur-2xl max-w-none w-[200%] h-auto rounded-full absolute"
						}
						width={0}
						height={0}
						priority={true}
						unoptimized={true}
						src={curInfo.image}
					/>
				))
			) : (
				<></>
			)}
		</div>
	);
}

function Context({ curInfo, setPlayerHidden }: { curInfo?: SongStateExtra; setPlayerHidden: any }) {
	return (
		<div className=" z-[1] playback flex justify-between items-center py-3">
			<button onClick={() => setPlayerHidden(true)}>
				<DownArrow />
			</button>
			<div className="text-xs text-center w-full">
				<p>{curInfo?.context?.header}</p>
				<p>{curInfo?.context?.name || "-"}</p>
			</div>
			<button onClick={() => (window.location.href = window.location.href)}>
				<MoreOptions />
			</button>
		</div>
	);
}

function SongInfo({
	viewType,
	curInfo,
	err,
}: {
	curInfo?: SongState;
	viewType?: number | undefined;
	err?: string;
}) {
	return (
		<div className="playback flex items-center overflow-hidden">
			{viewType !== undefined ? (
				<Image
					className="size-12 mr-2 rounded-md aspect-square bg-[#282828] border-none block"
					alt="alb-img"
					width={64}
					height={64}
					priority={false}
					unoptimized={true}
					src={curInfo?.image || blank}
				/>
			) : (
				<></>
			)}
			<div className="w-full h-12 content-center overflow-hidden">
				<div className="text-base w-full font-bold text-nowrap">
					<a href={curInfo?.uris.album}>{err || curInfo?.title}</a>
				</div>

				<div className="grid grid-flow-col gap-1 w-fit items-center">
					{curInfo?.isExplicit ? <Explicit /> : ""}
					<OverflowText className="w-full text-nowrap overflow-hidden text-xs">
						{curInfo?.artist}
					</OverflowText>
				</div>
			</div>
		</div>
	);
}
