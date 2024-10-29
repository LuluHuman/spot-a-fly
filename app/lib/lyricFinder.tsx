import { fetchLyrics, Musixmatch, Spotify, URIto } from "./api";
import { sylLine, Lyrics } from "./types";

export async function findLyrics(
	{
		cache,
		SpotifyClient,
		mxmClient,
	}: {
		cache: React.MutableRefObject<{
			[key: string]: any;
		}>;
		SpotifyClient?: Spotify;
		mxmClient?: Musixmatch;
	},
	{ uri, title, artist }: { uri: string; title: string; artist: string }
) {
	if (cache.current[uri]) return cache.current[uri];

	// If those tracks are fire and do not have synced lyrics
	// im doing it myself then
	const local = async () => {
		if (!uri.startsWith("spotify:track")) return undefined;

		const lyr = (await fetch("/api/getLyrics/" + URIto.id(uri)).then((d) => d.json())) as any;
		console.log(lyr, true, true);

		if (!lyr || !lyr.Type || lyr.Type == "Static") return;

		const lyricLines = parseLyricsBeuLyr(lyr);
		if (!lyricLines) return;

		return {
			source: "luluhoy.tech (meself)",
			type: lyr.Type as string,
			data: lyricLines,
		};
	};

	const beuLyr = async () => {
		if (!SpotifyClient) return;
		if (!uri.startsWith("spotify:track")) return undefined;

		const lyr = await fetchLyrics.beautifulLyrics(SpotifyClient, uri);
		if (!lyr || !lyr.Type || lyr.Type == "Static") return;

		const lyricLines = parseLyricsBeuLyr(lyr);
		if (!lyricLines) return;

		return {
			source: "beautiful-lyrics",
			type: lyr.Type as string,
			data: lyricLines,
		};
	};

	const mxmLyr = async () => {
		if (!mxmClient) return;

		const lyr = (await fetchLyrics.Musixmatch(mxmClient, title, artist)) as {
			lyrics: any[];
			copyright: string;
		};
		if (!lyr.lyrics || !lyr.lyrics[0]) return;

		const lyricLines = parseLyricsBasic(lyr.lyrics);
		return {
			source: "Musixmatch",
			type: "Line",
			data: lyricLines,
			copyright: lyr.copyright,
		};
	};

	const spotify = async () => {
		if (!SpotifyClient) return;
		if (!uri.startsWith("spotify:track")) return undefined;

		const lyr = (await fetchLyrics.spotify(SpotifyClient, uri)) as Lyrics[];

		if (!lyr || !lyr[0]) return undefined;

		const lyricLines = parseLyricsBasic(lyr);
		return { source: "Musixmatch (through Spotify)", type: "Line", data: lyricLines };
	};

	const netease = async () => {
		const lyr3 = (await fetchLyrics.netease(`${title} ${artist}`)) as any;
		if (!lyr3[0]) return;

		const lyricLines = parseLyricsBasic(lyr3);
		return { source: "netease", type: "Line", data: lyricLines };
	};

	type typeLyr = {
		source: string;
		type?: string;
		data: Lyrics[] | string;
		copyright?: string;
	};

	const find = async () => {
		const localRes = await local();
		console.log(localRes, true);

		if (localRes) return localRes;

		const beuLyrRes = await beuLyr();
		if (beuLyrRes) return beuLyrRes;

		const mxmLyrRes = await mxmLyr();
		if (mxmLyrRes) return mxmLyrRes;

		const spotifyRes = await spotify();
		if (spotifyRes) return spotifyRes;

		const neteaseRes = await netease();
		if (neteaseRes) return neteaseRes;

		return { source: "text", data: "not-found" };
	};
	const lyr: typeLyr = await find();
	cache.current[uri] = lyr;
	return lyr;
}

function parseLyricsBeuLyr(lyr: any): Lyrics[] | undefined {
	switch (lyr.Type) {
		// case "Static":
		// 	return (lyr.Lines as any[]).map((line: { Text: string }, i: number) => ({
		// 		msStart: 0,
		// 		msEnd: 0,
		// 		i: i,
		// 		element: <div>{line.Text} </div>,
		// 	})) as Lyrics[];

		case "Line":
			const lyricLines = lyr.Content;
			const children: Lyrics[] = [];
			children.push({
				msStart: 0,
				msEnd: lyricLines[0].StartTime * 1000,
				isInstrumental: true,
				element: <></>,
			});

			for (let i = 0; i < lyricLines.length; i++) {
				const lyricLine = lyricLines[i];

				const lyricStart = lyricLine.StartTime * 1000;
				const lyricEnd = lyricLine.EndTime * 1000;

				children.push({
					msStart: lyricStart,
					msEnd: lyricEnd,
					isOppositeAligned: lyricLine.OppositeAligned,
					element: <>{lyricLine.Text} </>,
				});

				if (!lyricLines[i + 1]) continue;

				const nextLyricLine = lyricLines[i + 1];
				const instrumEnd = parseInt(nextLyricLine.StartTime) * 1000;
				InsertInstrumental(children, lyricEnd, instrumEnd);
			}
			return children;
		case "Syllable": {
			const lyricLines = lyr.Content;

			const children: Lyrics[] = [];
			children.push({
				msStart: 0,
				msEnd: lyricLines[0].Lead.StartTime * 1000,
				isInstrumental: true,
				element: <></>,
			});

			for (let i = 0; i < lyricLines.length; i++) {
				const lyricLine = lyricLines[i];
				const leadSyllables = lyricLine.Lead.Syllables;

				const sylChildren = [];
				for (let ls = 0; ls < leadSyllables.length; ls++) {
					const leadSyllabl = leadSyllables[ls];
					const spacing = !leadSyllabl.IsPartOfWord ? " " : "";
					sylChildren.push({
						msStart: leadSyllabl.StartTime * 1000,
						msEnd: leadSyllabl.EndTime * 1000,
						element: leadSyllabl.Text + spacing,
					});
				}

				children.push({
					msStart: lyricLine.Lead.StartTime * 1000,
					msEnd: lyricLine.Lead.EndTime * 1000,
					isOppositeAligned: lyricLine.OppositeAligned,
					element: <></>,
					children: sylChildren,
				});

				if (lyricLine.Background) {
					const bgSylChildren = [];
					const bgSyllables = lyricLine.Background[0].Syllables;

					for (let ls = 0; ls < bgSyllables.length; ls++) {
						const bgSyllabl = bgSyllables[ls];
						const spacing = !bgSyllabl.IsPartOfWord ? " " : "";
						bgSylChildren.push({
							msStart: bgSyllabl.StartTime * 1000,
							msEnd: bgSyllabl.EndTime * 1000,
							element: bgSyllabl.Text + spacing,
						} as sylLine);
					}

					children.push({
						msStart: lyricLine.Background[0].StartTime * 1000,
						msEnd: lyricLine.Background[0].EndTime * 1000,
						isOppositeAligned: lyricLine.OppositeAligned,
						isBackground: true,
						element: <></>,
						children: bgSylChildren,
					} as Lyrics);
				}

				if (!lyricLines[i + 1]) continue;
				const nextLyricLine = lyricLines[i + 1];
				const lyricEnd = lyricLine.Lead.EndTime * 1000;
				const instrumEnd = parseInt(nextLyricLine.Lead.StartTime) * 1000;
				InsertInstrumental(children, lyricEnd, instrumEnd);
			}

			return children;
		}
		default:
			return undefined;
	}
}

function parseLyricsBasic(lyricLines: any) {
	const children: Lyrics[] = [];
	children.push({
		msStart: 0,
		msEnd: lyricLines[0] ? lyricLines[0].StartTime : 0,
		isInstrumental: true,
		element: <></>,
	});

	for (let i = 0; i < lyricLines.length; i++) {
		const lyricLine = lyricLines[i];

		const lyricStart = lyricLine.StartTime;
		const lyricEnd = lyricLine.EndTime;

		children.push({
			msStart: lyricStart,
			msEnd: lyricEnd,
			isOppositeAligned: lyricLine.OppositeAligned,
			element: <>{lyricLine.Text} </>,
			isInstrumental: lyricLine.Text == "",
		});
	}

	return children;
}

function InsertInstrumental(children: Lyrics[], start: number, end: number) {
	const isEmpty = start != end;
	const gap = end - start;
	if (isEmpty && gap > 2500) {
		const div = {
			msStart: start,
			msEnd: end - 100,
			isInstrumental: true,
			element: <></>,
		};
		children.push(div);
	}
}
