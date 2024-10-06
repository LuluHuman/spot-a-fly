import { NextTrack, SongState, SongStateExtra } from "../../lib/types";
import { Spotify } from "../../lib/api";
import { SongCard } from "../components";

const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";

export default function QueueView({
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
