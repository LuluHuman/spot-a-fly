import { Spotify } from "@/app/lib/api";
import { Lyrics, NextTrack } from "@/app/lib/types";
import { CSSProperties, useRef } from "react";
import { SongCard } from "../components";

const blank =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";
const roundGrad = (p: number) => (p > 100 ? 100 : p < 0 ? 0 : Number.isNaN(p) ? 100 : p);

export default function LyricView({
	lyrics: lyrcs,
	curProgressMs,
	contentType,
	lyricSource,
	SpotifyClient,
	nextSong,
}: {
	lyrics: Lyrics[];
	curProgressMs: number;
	contentType?: string;
	lyricSource: string;
	SpotifyClient?: Spotify;
	nextSong?: NextTrack;
}) {
	const Colors = useRef<any>();
	if (typeof lyrcs == "string") return <>{lyrcs}</>;
	SpotifyClient?.getColors(nextSong?.albumOfTrack.coverArt.sources[0].url).then((x) => {
		Colors.current = x.data?.extractedColors[0];
	});

	return (
		<>
			{lyrcs.map((x) =>
				parseLines(
					x,
					curProgressMs,
					contentType as "Line" | "Syllable" | "Static" | "queue" | undefined,
					SpotifyClient
				)
			)}
			<span className="text-sm opacity-25 whitespace-break-spaces">
				{"Lyrics provided by " + lyricSource}
			</span>
			<div
				className="rounded-lg bg-[var(--dark-color)] px-2"
				style={
					{
						"--dark-color": Colors.current?.colorDark?.hex,
					} as CSSProperties
				}>
				{nextSong ? (
					<SongCard
						title={nextSong?.name}
						artist={nextSong?.artists.items.map((a) => a.profile.name).join(" ")}
						isExplicit={nextSong.contentRating.label == "EXPLICIT"}
						albImg={nextSong?.albumOfTrack.coverArt.sources[0].url || blank}
					/>
				) : (
					<></>
				)}
			</div>
		</>
	);
}

function parseLines(
	{
		i,
		isInstrumental,
		isOppositeAligned,
		isBackground,
		msStart,
		msEnd,
		element: rawElement,
		children,
	}: Lyrics,
	curMs: number,
	showing: "Line" | "Syllable" | "Static" | "queue" | undefined,
	SpotifyClient?: Spotify
) {
	var element: React.JSX.Element | React.JSX.Element[] = rawElement;

	const inRange = curMs >= msStart && !(curMs >= msEnd);
	const lineType = isInstrumental
		? "instrumental "
		: "gradient-color lyrLine text-xl m-1 transition blur-[1px] w-full ";

	const lineAignment = isOppositeAligned ? "text-right " : "text-left ";

	var lineActive = "";
	var gradientProgress = 0;

	if (showing == "Syllable" && children) {
		if (inRange) lineActive = " lineActive";
		element = children.map(({ msStart, msEnd, element: elementT }) => {
			const inSylRange = curMs >= msStart;

			const ad = !inSylRange ? "sylInactive" : "sylActive";
			const bgClass = isBackground ? "text-sm " : "";
			const startOffset = curMs - msStart;
			const endOffset = msEnd - msStart;
			const p = (startOffset / endOffset) * 100;
			const css = {
				"--gradient-progress": `${roundGrad(p)}%`,
			};
			return (
				<span
					className={bgClass + ad}
					style={css as React.CSSProperties}
					key={`${msStart} - ${msEnd}: ${elementT.toString()}`}>
					{elementT}
				</span>
			);
		});
	}
	if (inRange) Active();
	function Active() {
		const actveStart = curMs - msStart;
		const activeEnd = msEnd - msStart;
		if (isInstrumental) {
			const timeLeft = msEnd - curMs;

			const subtract = ((activeEnd - 1000) % 2) + 1000;
			const durInsPer = actveStart / (activeEnd - subtract);

			const insDots = [0, 1, 2].map((i) => {
				const startAt = i / 3;
				const alphaSigma = durInsPer >= startAt ? durInsPer : 0;
				const css = { "--alpha": `${alphaSigma}` };
				return (
					<span
						key={i}
						style={css as React.CSSProperties}
					/>
				);
			});
			const animate = timeLeft < subtract ? "animation-end" : "animation";
			const ins = <div className={`instrumentalText animation ${animate}`}>{insDots}</div>;
			element = ins;
			lineActive = " lineActive";
		}
		if (showing == "Line") {
			const durLyrPercentage = roundGrad((actveStart / activeEnd) * 100);
			gradientProgress = durLyrPercentage;
			lineActive = " lineActive lineAnimate";
			return;
		}
	}
	return (
		<button
			className={`${lineType + lineAignment + lineActive}`}
			style={
				gradientProgress > 0
					? ({
							"--gradient-progress": `${gradientProgress}%`,
					  } as React.CSSProperties)
					: undefined
			}
			ref={(ref) => {
				if (msStart - curMs < 200 && msStart - curMs > 0) {
					ref?.scrollIntoView({
						block: "center",
						behavior: "smooth",
					});
				}
			}}
			onClick={() => SpotifyClient?.SeekTo(Math.ceil(msStart))}
			key={showing == "Static" ? i : `${msStart} - ${msEnd}: ${element.toString()}`}>
			{element}
		</button>
	);
}
