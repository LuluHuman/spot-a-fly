import { Devices, NextIcon, PauseIcon, PlayIcon, PrevIcon, Repeat, RepeatOne, Shuffle } from "./icons";
import { SongState } from "../lib/types";
import { Spotify } from "../lib/api";
import { ButtonWithFetchState } from "./components";



export function DeviceCurrenlyPlaying({ curInfo }: { curInfo?: SongState }) {
	return (
		<div className="my-3 flex items-center  *:mx-1 *:text-[#1ed760] *:fill-[#1ed760]">
			<Devices />
			<span>{curInfo?.deviceText}</span>
		</div>
	);
}

export function Buttons({
	SpotifyClient,
	isPaused,
	curInfo,
}: {
	SpotifyClient?: Spotify;
	isPaused: boolean;
	curInfo?: SongState;
}) {
	return (
		<>
			<ButtonWithFetchState
				className={`size-10 p-2 my-2 ${
					curInfo?.options.shuffling_context ? "fill-[#1ed760]" : "fill-white"
				}`}
				clickAction={() =>
					SpotifyClient?.playback("shuffle", !curInfo?.options.shuffling_context)
				}>
				<Shuffle />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				className="size-12 p-2 my-2 fill-white"
				clickAction={() => SpotifyClient?.playback("skipPrev")}>
				<PrevIcon />
			</ButtonWithFetchState>
			<ButtonWithFetchState
				className="size-16 bg-white p-5 rounded-full my-2"
				clickAction={() => SpotifyClient?.playback(!isPaused ? "pause" : "play")}>
				{isPaused ? <PauseIcon /> : <PlayIcon />}
			</ButtonWithFetchState>
			<ButtonWithFetchState
				className="size-12 p-2 my-2 fill-white"
				clickAction={() => SpotifyClient?.playback("skipNext")}>
				<NextIcon />
			</ButtonWithFetchState>
			<button
				className={`size-10 p-2 my-2 ${
					curInfo?.options.repeating_context ? "fill-[#1ed760]" : "fill-white"
				}`}>
				{curInfo?.options.repeating_track ? <RepeatOne /> : <Repeat />}
			</button>
		</>
	);
}
