import {
	AddToPlaylist,
	DeviceIcon,
	Devices,
	NextIcon,
	PauseIcon,
	PlayIcon,
	PrevIcon,
	Repeat,
	RepeatOne,
	Saved,
	Shuffle,
} from "./icons";
import { EditablePlaylist, SongState, SongStateExtra } from "../lib/types";
import { Spotify } from "../lib/api";
import { ButtonWithFetchState } from "./components";

export function DeviceCurrenlyPlaying({
	curInfo,
	setDevicesOverlay,
}: {
	curInfo?: SongState;
	setDevicesOverlay: (s: boolean) => any;
}) {
	return (
		<button
			className="my-3 flex items-center  *:mx-1 *:text-primarySpotify *:fill-primarySpotify"
			onClick={() => setDevicesOverlay(true)}>
			<DeviceIcon
				deviceType={
					curInfo?.deviceId && curInfo?.devices
						? curInfo?.devices[curInfo.deviceId].device_type
						: ""
				}
			/>
			<span>{curInfo?.deviceText || "No active device"}</span>
		</button>
	);
}

export function Buttons({
	SpotifyClient,
	isPaused,
	curInfo,
	setErrToast,
}: {
	SpotifyClient?: Spotify;
	isPaused: boolean;
	curInfo?: SongState;
	setErrToast: any;
}) {
	const disabled = curInfo?.deviceId === undefined;
	return (
		<>
			<ButtonWithFetchState
				disabled={disabled}
				setErrToast={setErrToast}
				className={`size-10 p-2 my-2 ${
					curInfo?.options.shuffling_context ? "fill-primarySpotify" : "fill-white"
				}`}
				clickAction={() =>
					SpotifyClient?.playback("shuffle", !curInfo?.options.shuffling_context)
				}>
				<Shuffle />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				disabled={disabled}
				setErrToast={setErrToast}
				className="size-12 p-2 my-2 fill-white"
				clickAction={() => SpotifyClient?.playback("skipPrev")}>
				<PrevIcon />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				disabled={disabled}
				setErrToast={setErrToast}
				className="size-16 bg-white p-5 rounded-full my-2"
				clickAction={() => SpotifyClient?.playback(!isPaused ? "pause" : "play")}>
				{isPaused ? <PauseIcon /> : <PlayIcon />}
			</ButtonWithFetchState>
			<ButtonWithFetchState
				disabled={disabled}
				setErrToast={setErrToast}
				className="size-12 p-2 my-2 fill-white"
				clickAction={() => SpotifyClient?.playback("skipNext")}>
				<NextIcon />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				disabled={disabled}
				setErrToast={setErrToast}
				className={`size-10 p-2 my-2 ${
					curInfo?.options.repeating_context ? "fill-primarySpotify" : "fill-white"
				}`}
				clickAction={() => {
					const states = ["off", "context", "track"];

					const isRepeating = curInfo?.options.repeating_context;
					if (!isRepeating) return SpotifyClient?.playback("repeat", states[1]);

					const isRepeatingTrack = curInfo?.options.repeating_track;
					const i = isRepeatingTrack ? 0 : 2;

					return SpotifyClient?.playback("repeat", states[i]);
				}}>
				{curInfo?.options.repeating_track ? <RepeatOne /> : <Repeat />}
			</ButtonWithFetchState>
		</>
	);
}

export function AddToButton({
	SpotifyClient,
	curInfo,
	curInfoExtra,
	setAddToModal,
	modalHistory,
	className,
}: {
	SpotifyClient?: Spotify;
	curInfo?: SongState;
	curInfoExtra?: SongStateExtra;
	setAddToModal: any;
	modalHistory: any;
	className?: string;
}) {
	return (
		<button
			className={className ? className : "fill-white pl-4"}
			onClick={() => {
				const songUri = curInfo?.uris.song;
				if (!songUri || !SpotifyClient) return;
				SpotifyClient.getEditablePlaylists([songUri]).then((data) => {
					const playlists = data as EditablePlaylist;
					modalHistory.current.push(playlists.data.me.editablePlaylists);
					setAddToModal(playlists.data.me.editablePlaylists);
				});
			}}>
			{curInfoExtra?.isSaved ? <Saved className="h-6" /> : <AddToPlaylist />}
		</button>
	);
}
