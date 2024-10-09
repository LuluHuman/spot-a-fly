"use client";

import { useEffect, useState } from "react";
import { useSession } from "./playerRoot";
import Image from "next/image";

const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";
export default function Home() {
	const { SpotifyClient } = useSession();
	const [user, setUser] = useState<any>();
	const [libraryItems, setLibraryItems] = useState<any>();

	useEffect(() => {
		if (!SpotifyClient) return;

		SpotifyClient.addReadyListener(() => {
			SpotifyClient.getMe().then((me) => {
				if (!me) return;
				console.log(me, "SpotifyClient");
				setUser(me);
			});
			SpotifyClient.getLibrary().then((data) => {
				const datadata = (data as any).data;
				if (!datadata || !datadata.me) return;

				const libraryV3items = datadata.me?.libraryV3.items;
				setLibraryItems(libraryV3items);
			});
		});
	}, [SpotifyClient]);

	return (
		<div className="flex flex-col items-center w-dvw h-dvh overflow-scroll">
			<h1 className="p-3 mt-5 text-xl font-bold flex items-center text-left w-full">
				<Image
					className="size-6 rounded-full aspect-square bg-[#282828] border-none inline-block mx-2"
					alt="coverArt"
					width={0}
					height={0}
					priority={false}
					unoptimized={true}
					src={(user?.images ? user?.images[0].url : undefined) || blank}
				/>
				<span>Your Library</span>
			</h1>
			<div className="flex flex-wrap justify-evenly">
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
		</div>
	);
}
