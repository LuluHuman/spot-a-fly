import { sylLine, Lyrics } from "./types";

export function parseLyricsBeuLyr(lyr: any): Lyrics[] | undefined {
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
				insertInstrumental(children, lyricEnd, instrumEnd);
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
				insertInstrumental(children, lyricEnd, instrumEnd);
			}

			return children;
		}
		default:
			return undefined;
	}
}

export function parseLyricsBasic(lyricLines: any) {
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

function insertInstrumental(children: Lyrics[], start: number, end: number) {
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