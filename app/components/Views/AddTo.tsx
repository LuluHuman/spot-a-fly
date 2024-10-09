import { Spotify, URIto } from "@/app/lib/api";
import { EditablePlaylist } from "@/app/lib/types";
import Image from "next/image";
import { LeftArrow, Pinned, Saved } from "../icons";

export default function AddToView({
	addToModal,
	setAddToModal,
	songUri,
	SpotifyClient,
	setToast,
	modalHistory,
	isPaused,
}: {
	addToModal: EditablePlaylist["data"]["me"]["editablePlaylists"];
	setAddToModal: any;
	songUri?: string;
	SpotifyClient?: Spotify;
	setToast: any;
	modalHistory: any;
	isPaused: boolean;
}) {
	function modal(item: EditablePlaylist["data"]["me"]["editablePlaylists"]["items"][0]) {
		const images = item.item.data.images;
		const image = item.item.data.image;
		const image_src = image ? image.sources[0] : undefined;
		const images_src = images ? images.items[0].sources[0] : undefined;
		const src = image_src?.url || images_src?.url;

		function modalClick() {
			if (!SpotifyClient) return;
			if (item.item.data.__typename == "Folder") {
				const folderUri = item.item._uri;
				if (!folderUri || !songUri || !SpotifyClient) return;
				SpotifyClient.getEditablePlaylists([songUri], folderUri).then((data) => {
					const playlists = data as EditablePlaylist;

					modalHistory.current.push(playlists.data.me.editablePlaylists);
					const modal = modalHistory.current[modalHistory.current.length - 1];
					setAddToModal(modal);
				});
			} else {
				if (!songUri) return;
				const addingToLiked = item.item.data.uri == "spotify:collection:tracks";

				const methods = {
					add: {
						playlist: SpotifyClient.appendToPlaylist,
						liked: SpotifyClient.saveTrack,
					},
					remove: {
						playlist: SpotifyClient.removeFromPlaylist,
						liked: SpotifyClient.removeSavedTrack,
					},
				};

				const method =
					methods[item.curates ? "remove" : "add"][
						addingToLiked ? "liked" : "playlist"
					].bind(SpotifyClient);

				method(
					addingToLiked ? songUri : URIto.id(item.item.data.uri),
					addingToLiked ? "" : songUri
				).then(() => setAddToModal(undefined));

				const acion = item.curates ? "Removed from " : "Added to ";
				const to = songUri ? "Liked Songs" : "playlist";
				setToast(acion + to);

				SpotifyClient.playback(isPaused ? "play" : "pause").then(() =>
					SpotifyClient.playback(!isPaused ? "play" : "pause")
				);
			}
		}

		return (
			<button
				key={item.item._uri}
				className="flex justify-between p-2 w-full"
				onClick={modalClick}>
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
	}
	return (
		<div className="fixed w-dvw h-dvh bg-neutral-900 z-30 px-4">
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
			<div>{addToModal?.items.map(modal)}</div>
		</div>
	);
}
