import { useEffect, useRef } from "react";
import { SongState, SongStateExtra } from "../lib/types";

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function Backdrop({
	curInfo,
	curInfoExtra,
}: {
	curInfo?: SongState;
	curInfoExtra: SongStateExtra;
}) {
	return curInfoExtra?.canvasUrl && !curInfoExtra?.canvasUrl?.endsWith("jpg") ? (
		<div className="absolute -z-[1] h-full top-0 flex justify-center w-full overflow-hidden bg-black">
			<video
				src={curInfoExtra?.canvasUrl}
				loop
				autoPlay
				className="blur-md h-full saturate-200 brightness-50 max-w-none"
			/>
		</div>
	) : (
		<div
			className="-z-[1] size-full max-h-[55%] max-w-[35%] fixed saturate-200 brightness-[0.65] overflow-hidden scale-x-[290%] scale-y-[185%] origin-top-left pointer-events-none"
			style={{
				background: "linear-gradient(var(--light-color), var(--dark-color), black)",
			}}>
			{curInfo && curInfo.image ? <BackdropColor img={curInfo.image} /> : <></>}
		</div>
	);
}

function BackdropColor({ img }: { img: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		fetch(`/api/getColors/${encodeURIComponent(img)}`)
			.then((d) => d.json())
			.then((COLORS) => {
				const ctx = canvasRef.current?.getContext("2d");
				const canvas = canvasRef.current;
				if (!ctx || !canvas) return;
				ctx.canvas.width = window.innerWidth;
				ctx.canvas.height = window.innerHeight;
				let width = (canvas.width = innerWidth);
				let height = (canvas.height = innerHeight - 48);

				let colorC = 0;
				let circles: any[] = [];
				class Circle {
					X: number;
					Y: number;
					VelX: number;
					VelY: number;
					Radius: number;
					RGB: { r: number; g: number; b: number };
					shrink: boolean;
					constructor(
						x: number,
						y: number,
						Velx: number,
						Vely: number,
						rgb: { r: number; g: number; b: number }
					) {
						this.X = x;
						this.Y = y;
						this.VelX = Velx;
						this.VelY = Vely;
						this.Radius = 1;
						this.RGB = rgb;
						this.shrink = false;
					}

					draw() {
						if (this.Radius <= 0) return;
						if (!ctx || !canvas) return;
						ctx.beginPath();
						const g = ctx.createRadialGradient(
							this.X,
							this.Y,
							this.Radius * 0.01,
							this.X,
							this.Y,
							this.Radius
						);
						let rgb = this.RGB;
						g.addColorStop(0.1, `rgba(${rgb.r},${rgb.g},${rgb.b},1)`);
						g.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
						ctx.fillStyle = g;
						ctx.arc(this.X, this.Y, this.Radius, 0, Math.PI * 2, false);
						ctx.fill();
					}
					Move() {
						if (this.shrink) {
							if (this.Radius <= 0) circles.splice(0, 1);
							this.Radius -= 0.5;
						} else {
							if (this.Radius > 300) this.shrink = true;
							this.Radius += 0.5;
						}
						if (this.X >= width || this.X <= 0) {
							this.VelX = -this.VelX;
						}
						if (this.Y >= height || this.Y <= 0) {
							this.VelY = -this.VelY;
						}
						this.X += this.VelX / 10;
						this.Y += this.VelY / 10;
					}
				}

				function spawnSpot() {
					let circOjb = new Circle(
						random(1200, width - 1200),
						random(1200, height - 1200),
						Math.floor(Math.random() * 5 + 1) - 3,
						Math.floor(Math.random() * 5 + 1) - 3,
						COLORS[colorC]
					);
					if (++colorC >= COLORS.length) colorC = 0;
					circles.push(circOjb);
				}

				for (let i = 0; i < 100; i++) spawnSpot();
				setInterval(spawnSpot, 100);

				function animation() {
					requestAnimationFrame(animation);
					if (!ctx || !canvas) return;
					ctx.clearRect(0, 0, width, height);
					circles.forEach(function (circObj) {
						circObj.Move();
						circObj.draw();
					});
				}
				animation();
			});
	}, [img]);
	return (
		<div style={{ backgroundColor: "var(--dark-color)" }}>
			<canvas
				className="blur-xl"
				ref={canvasRef}></canvas>
		</div>
	);
}
