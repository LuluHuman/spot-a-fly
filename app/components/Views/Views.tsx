import { Spotify } from "@/app/lib/api";
import { Lyrics, NextTrack, SongState, SongStateExtra } from "../../lib/types";
import LyricView from "./Lyric";
import Image from "next/image";
import QueueView from "./Queue";
import { LyricsIcon } from "../icons";

const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";

export default function View({
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
					<div className="overflow-y-scroll text-2xl font-bold clip-path h-full relative">
						<div className="extra absolute w-full p-3">{lyricsView}</div>
					</div>
				) : (
					<div className="text-2xl font-bold clip-path h-full flex justify-center items-center">
						<div className="fill-white border-white border-2 rounded-full size-8 m-2 flex justify-center items-center">
							<LyricsIcon />
						</div>
						<span>No lyrics found</span>
					</div>
				)
			) : (
				<></>
			)}
			{viewType == 1 ? <div className="px-3">{queueView}</div> : <></>}
		</>
	);
}
