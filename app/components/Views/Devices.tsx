import { Spotify } from "@/app/lib/api";
import { SongState } from "@/app/lib/types";
import { Close, DeviceIcon } from "../icons";
import { ButtonWithFetchState } from "../components";
import React, { useEffect, useState } from "react";

export default function DeviceSelector({
	ShowDevices,
	SpotifyClient,
	curInfo,
	setDevicesOverlay,
}: {
	ShowDevices: boolean;
	SpotifyClient?: Spotify;
	curInfo?: SongState;
	setDevicesOverlay: (e: boolean) => any;
}) {
	const [devices, setDevices] = useState<React.JSX.Element | undefined>();
	useEffect(() => {
		const dev = (
			<div
				className="p-4 flex flex-col rounded-lg m y-8"
				style={{
					background:
						"radial-gradient(82.95% 283.44% at 50% -160.29%,rgba(30,215,96,.3) 0,#181818 100%)",
				}}>
				<span className="text-xl font-extrabold flex items-center">No active device</span>
			</div>
		);
		if (!curInfo?.devices) return setDevices(dev);
		if (!curInfo?.deviceId) return setDevices(dev);
		setDevices(
			<div
				className="p-4 flex flex-col rounded-lg m y-8"
				style={{
					background:
						"radial-gradient(82.95% 283.44% at 50% -160.29%,rgba(30,215,96,.3) 0,#181818 100%)",
				}}>
				<span className="text-xl font-extrabold flex items-center">
					<DeviceIcon
						className="fill-primarySpotify mx-1 size-5"
						deviceType={curInfo?.devices[curInfo.deviceId].device_type}
					/>
					Current device
				</span>
				{curInfo?.devices[curInfo.deviceId].name}
			</div>
		);
	}, [SpotifyClient, curInfo, setDevicesOverlay]);

	return (
		<div
			className={`fixed w-dvw h-dvh bg-neutral-900 z-10 px-4 py-4 ${
				ShowDevices ? "top-0" : "top-full"
			} transition-all`}>
			<div
				className="flex justify-end pb-4"
				onClick={() => setDevicesOverlay(false)}>
				<Close />
			</div>
			{devices}
			<div className="my-2">Select a device</div>
			{Object.keys(curInfo?.devices || {}).map((deviceId) => {
				if (!curInfo?.devices) return;
				if (curInfo.deviceId == deviceId) return;
				const device = curInfo?.devices[deviceId];
				return (
					<ButtonWithFetchState
						className="w-full text-left flex items-center"
						key={deviceId}
						clickAction={() => {
							setDevicesOverlay(false);
							return SpotifyClient?.setDevice(deviceId);
						}}>
						<DeviceIcon
							className="m-2 fill-white"
							deviceType={device.device_type}
						/>
						{device.name}
					</ButtonWithFetchState>
				);
			})}
		</div>
	);
}
