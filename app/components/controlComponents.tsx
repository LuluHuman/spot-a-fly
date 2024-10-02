import {
	Devices,
	NextIcon,
	PauseIcon,
	PlayIcon,
	PrevIcon,
	Repeat,
	RepeatOne,
	Shuffle,
} from "./icons";
import { SongState } from "../lib/types";
import { Spotify } from "../lib/api";
import { ButtonWithFetchState } from "./components";

export function DeviceCurrenlyPlaying({ curInfo }: { curInfo?: SongState }) {
	return (
		<div className="my-3 flex items-center  *:mx-1 *:text-[#1ed760] *:fill-[#1ed760]">
			<Devices />
			<span>{curInfo?.deviceText || "NO DEVICE"}</span>
		</div>
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
	return (
		<>
			<ButtonWithFetchState
				setErrToast={setErrToast}
				className={`size-10 p-2 my-2 ${
					curInfo?.options.shuffling_context ? "fill-[#1ed760]" : "fill-white"
				}`}
				clickAction={() =>
					SpotifyClient?.playback("shuffle", !curInfo?.options.shuffling_context)
				}>
				<Shuffle />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				setErrToast={setErrToast}
				className="size-12 p-2 my-2 fill-white"
				clickAction={() => SpotifyClient?.playback("skipPrev")}>
				<PrevIcon />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				setErrToast={setErrToast}
				className="size-16 bg-white p-5 rounded-full my-2"
				clickAction={() => SpotifyClient?.playback(!isPaused ? "pause" : "play")}>
				{isPaused ? <PauseIcon /> : <PlayIcon />}
			</ButtonWithFetchState>
			<ButtonWithFetchState
				setErrToast={setErrToast}
				className="size-12 p-2 my-2 fill-white"
				clickAction={() => SpotifyClient?.playback("skipNext")}>
				<NextIcon />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				setErrToast={setErrToast}
				className={`size-10 p-2 my-2 ${
					curInfo?.options.repeating_context ? "fill-[#1ed760]" : "fill-white"
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
