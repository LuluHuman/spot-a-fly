"use client";

import "./style.css";
import Image from "next/image";
import React, { use, useEffect, useRef, useState } from "react";

import { AddToPlaylist, Explicit, LyricsIcon, Queue, Saved } from "./components/icons";
import OverflowText from "./components/OverflowText";
import { Timestamp } from "./components/components";
import { DeviceCurrenlyPlaying, Buttons } from "./components/controlComponents";

import { Musixmatch, Spotify, URIto } from "./lib/api";
import { PlayerState, SpotifyWebhook, SongState, Lyrics, EditablePlaylist } from "./lib/types";
import { findLyrics } from "./lib/lyricFinder";
import collectState from "./lib/collectState";
import { AddToView, View } from "./components/Views";

import { useSearchParams } from "next/navigation";
const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";

export default function Home() {
	const searchParams = useSearchParams();
	const v = searchParams.get("viewId");
	const lastV = useRef(v);

	const [SpotifyClient, setSpotifyClient] = useState<Spotify>();

	const [curInfo, setInfo] = useState<SongState>();
	const [addToModal, setAddToModal] =
		useState<EditablePlaylist["data"]["me"]["editablePlaylists"]>();

	const [isPaused, setPaused] = useState<boolean>(true);
	const [viewType, setViewType] = useState<undefined | number>(v ? parseInt(v) : undefined);
	const [state, setPlayerState] = useState<SpotifyWebhook["payloads"][0]["cluster"]>();

	const [lyricText, setLyricsText] = useState<React.JSX.Element | React.JSX.Element[] | string>();
	const [lyrcs, setLyrics] = useState<Lyrics[]>();

	const [err, setErr] = useState<string | undefined>();
	const [toast, setToast] = useState<string | undefined>();

	var cache = useRef<{ [key: string]: any }>({});

	var mxmClient = useRef<Musixmatch>();
	var lyrSource = useRef("");
	var lastTrackUri = useRef("");

	var lyricType = useRef<"Line" | "Syllable" | "Static">();
	var currentInveral = useRef<NodeJS.Timeout>();
	var [curProgressMs, setCurProgressMs] = useState<number>(0);
	var curDurationMs = useRef<number>(0);

	if (v !== lastV.current) {
		lastV.current = v;
		setViewType(v ? parseInt(v) : undefined);
	}

	useEffect(() => setSpotifyClient(new Spotify()), []);
	useEffect(() => {
		if (!SpotifyClient) return;

		mxmClient.current = new Musixmatch();

		SpotifyClient.ready = () => {
			if (!SpotifyClient.session.accessToken) return setErr("Error: No Spotify Acces Token");
			if (SpotifyClient.session.isAnonymous) {
				const token = prompt("sp_dc Access Token:");
				fetch("/api/session", {
					method: "POST",
					body: JSON.stringify({ session: token }),
				}).then(() => (window.location.href = window.location.href));
				return;
			}
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

		const timestamp = parseInt(player_state.timestamp);
		const ms = parseInt(player_state.position_as_of_timestamp);
		const startTimestamp = timestamp - ms;

		setCurProgressMs(ms);
		const songDuration = parseInt(player_state.duration);
		curDurationMs.current = songDuration;
		const _msStep = 100;
		const inveral = setInterval(() => {
			if (player_state.is_paused) return clearInterval(inveral);
			if (currentInveral.current !== inveral) {
				clearInterval(currentInveral.current);
				currentInveral.current = inveral as NodeJS.Timeout;
			}
			const ms = new Date().getTime() - startTimestamp;
			const songDuration = parseInt(player_state.duration);
			setCurProgressMs(ms);
			curDurationMs.current = songDuration;
		}, _msStep);

		if (lastTrackUri.current == trackUri) {
			collectState(trackId, SpotifyClient, state).then((changedState) => {
				console.log("Changed info: ", changedState);
				setInfo(changedState);
			});
			return;
		}
		lastTrackUri.current = trackUri;

		setLyricsText(undefined);
		setLyrics(undefined);

		SpotifyClient.getColors(player_state.track.metadata.image_xlarge_url).then(
			(fetchColours: any) => {
				if (!fetchColours.data) {
					document.body.style.setProperty("--dark-color", "");
					document.body.style.setProperty("--light-color", "");
					return;
				}
				const Colors = fetchColours.data.extractedColors[0];
				document.body.style.setProperty("--dark-color", Colors.colorDark.hex);
				document.body.style.setProperty("--light-color", Colors.colorLight.hex);
			}
		);

		collectState(trackId, SpotifyClient, state).then((changedState: SongState) => {
			console.log("Info: ", changedState);
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
				if (data == "not-found") return setLyricsText(undefined);

				lyricType.current = type;
				const cpyAttribute = copyright ? "\n" + copyright : "";
				lyrSource.current = source + cpyAttribute;
				setLyrics(data);
			});

			//Cache next Song
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
			<Backdrop curInfo={curInfo} />

			{addToModal ? (
				<AddToView
					addToModal={addToModal}
					setAddToModal={setAddToModal}
					songUri={curInfo?.uris.song}
					SpotifyClient={SpotifyClient}
					setToast={setToast}
				/>
			) : (
				<></>
			)}

			<Context curInfo={curInfo} />
			<div
				id="side"
				className="overflow-scroll">
				{toast ? (
					<Toast
						toast={toast}
						setToast={setToast}
					/>
				) : (
					<></>
				)}
				<View
					SpotifyClient={SpotifyClient}
					viewType={viewType}
					curInfo={curInfo}
					lyrics={lyrcs}
					lyricText={lyricText}
					lyrSource={lyrSource.current}
					lyricType={lyricType.current}
					curProgressMs={curProgressMs}
				/>
			</div>
			<div className="track px-4">
				<div className="flex items-center justify-between py-3 w-full">
					<SongInfo
						curInfo={curInfo}
						viewType={viewType}
						err={err}
					/>
					<AddToButton
						SpotifyClient={SpotifyClient}
						curInfo={curInfo}
						setAddToModal={setAddToModal}
					/>
				</div>
				<div>
					<div
						id="track"
						className="relative top-[-10px]">
						<div
							style={
								{
									"--width": `${(curProgressMs / curDurationMs.current) * 100}%`,
								} as React.CSSProperties
							}
						/>
					</div>
					<div className="flex w-full justify-between *:text-xs">
						<Timestamp ms={curProgressMs} />
						<Timestamp ms={curDurationMs.current} />
					</div>
				</div>
				<div className="flex justify-center items-center *:mx-1">
					<Buttons
						SpotifyClient={SpotifyClient}
						isPaused={isPaused}
						curInfo={curInfo}
						setErrToast={setToast}
					/>
				</div>
				<div className="my-3 flex items-center justify-between">
					<DeviceCurrenlyPlaying curInfo={curInfo} />
					<div>
						<button
							className={viewType == 0 ? "fill-[#1ed760]" : "fill-white"}
							onClick={() => buttonClick(0)}>
							<LyricsIcon />
						</button>
						<button
							className={viewType == 1 ? "fill-[#1ed760]" : "fill-white"}
							onClick={() => buttonClick(1)}>
							<Queue />
						</button>
					</div>
				</div>
			</div>
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

function Backdrop({ curInfo }: { curInfo?: SongState }) {
	return curInfo?.canvasUrl ? (
		<div className="absolute z-[-1] h-full top-0 flex justify-center w-full overflow-hidden bg-black">
			<video
				src={curInfo?.canvasUrl}
				loop
				autoPlay
				className="blur-md h-full saturate-200 brightness-50 max-w-none"
			/>
		</div>
	) : (
		<div id="bg">
			{curInfo && curInfo.image ? (
				["Front", "Back", "BackCenter"].map((classes) => (
					<Image
						alt="bg"
						key={classes}
						className={classes}
						width={0}
						height={0}
						priority={false}
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

function Context({ curInfo }: { curInfo?: SongState }) {
	return (
		<div className="playback flex items-center py-3">
			<div className="text-xs text-center w-full">
				<p>{curInfo?.context?.header}</p>
				<p>{curInfo?.context?.name || "-"}</p>
			</div>
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
					className="size-12 mr-2"
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
			<div className="w-full h-12 content-center">
				<div className="playingTitle text-base w-full">
					<a href={curInfo?.uris.album}>{err || curInfo?.title}</a>
				</div>

				<div className="grid grid-flow-col gap-1 w-fit items-center">
					{curInfo?.isExplicit ? <Explicit /> : ""}
					<OverflowText className="playingArtist text-xs">{curInfo?.artist}</OverflowText>
				</div>
			</div>
		</div>
	);
}

function AddToButton({
	SpotifyClient,
	curInfo,
	setAddToModal,
}: {
	SpotifyClient?: Spotify;
	curInfo?: SongState;
	setAddToModal: any;
}) {
	return (
		<button
			className="fill-white pl-4"
			onClick={() => {
				const songUri = curInfo?.uris.song;
				if (!songUri || !SpotifyClient) return;
				SpotifyClient.getEditablePlaylists([songUri]).then((data) => {
					const playlists = data as EditablePlaylist;
					setAddToModal(playlists.data.me.editablePlaylists);
				});
			}}>
			{curInfo?.isSaved ? <Saved className="h-6" /> : <AddToPlaylist />}
		</button>
	);
}
