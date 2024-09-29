import { HTMLAttributes, useEffect, useRef, useState } from "react";

export default function OverflowText({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: HTMLAttributes<HTMLDivElement>["className"];
}) {
	const textRef = useRef<HTMLDivElement>(null);
	const [overflow, setOverflow] = useState(0);
	const [transX, setTransX] = useState(0);

	useEffect(() => {
		const element = textRef.current;
		if (element) setOverflow(element.scrollWidth - element.clientWidth);

		return () => setOverflow(0);
	}, [children]);

	useEffect(() => {
		if (!(overflow > 2	)) return;
		let isGoingForwards = true;
		let breakMovement = false;
		let targetOffset = overflow;
		let currentOffset = 0;

		move();
		function move() {
			if (breakMovement) return;
			if (currentOffset == targetOffset) {
				targetOffset = isGoingForwards ? 0 : overflow;
				isGoingForwards = !isGoingForwards;
				setTimeout(move, 5000);
				return;
			}
			setTransX(currentOffset * -1);
			currentOffset += 1 * (isGoingForwards ? 1 : -1);
			setTimeout(move, 100);
		}
		return () => {
			breakMovement = true;
		};
	}, [overflow]);
	return (
		<div
			className={className}
			style={
				overflow > 0
					? {
							WebkitMaskImage: `linear-gradient(to right,transparent 0,#000 6px,#000 calc(100% - 12px),transparent 100%)`,
							maskImage: `linear-gradient(to right,transparent 0,#000 6px,#000 calc(100% - 12px),transparent 100%)`,
					  }
					: undefined
			}
			ref={textRef}>
			<div
				style={
					overflow > 0
						? {
								transform: `translateX(${transX}px)`,
						  }
						: undefined
				}>
				<span>{children}</span>
			</div>
		</div>
	);
}
