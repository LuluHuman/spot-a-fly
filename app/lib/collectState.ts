import { Spotify, URIto } from "./api";
import { PlayerState, SongState, Cluster, NextTracks, NextTrack } from "./types";

const blank =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";

export default async function collectState(trackId: string, SpotifyClient: Spotify, state: Cluster) {
    const player_state = (state?.player_state || state) as PlayerState;

    const getQueue = async () => {
        const queueArr = []

        const next50Tracks = player_state.next_tracks.slice(0, 50)
        const uris = next50Tracks.map(nextTrack => nextTrack.uri).filter(uri => uri.startsWith("spotify:track"))
        const queue = await SpotifyClient.decorateTrack(uris).then((data) => (data as unknown as NextTracks).data)

        if (!queue) return []
        let i_deco = 0
        for (let i = 0; i < next50Tracks.length; i++) {
            const nextTrack = next50Tracks[i];
            const nextTrackFromDecor = queue.tracks[i_deco];
            const uri = nextTrack.uri

            if (uri == "spotify:delimiter") return queueArr
            if (nextTrackFromDecor && nextTrackFromDecor.uri == uri) {
                nextTrackFromDecor.provider = nextTrack.provider
                nextTrackFromDecor.uid = nextTrack.uid
                queueArr.push(nextTrackFromDecor);
                i_deco++
                continue
            }


            const artistFromURI = nextTrack.metadata.artist_uri ? decodeURIComponent(URIto.id(nextTrack.metadata.artist_uri)).replaceAll("+", " ") : null
            queueArr.push({
                __typename: "Track",
                provider: nextTrack.provider,
                albumOfTrack: {
                    coverArt: {
                        sources: [{
                            height: 64,
                            url: blank,
                            width: 64,
                        }]
                    },
                },
                artists: {
                    items: [
                        {
                            profile: { name: artistFromURI },
                            uri: "",
                        },
                    ],
                },
                contentRating: { label: "NONE" },
                name: nextTrack.metadata.title,
                uri: uri,
                uid: nextTrack.uid
            } as NextTrack);
        }
        return queueArr
    }

    const trackMetadata = await (async () => {
        if (player_state.track.uri.includes("local")) return { album: undefined, original_title: undefined, explicit: undefined, artist: undefined }
        return (await SpotifyClient.getTrackMetadata(trackId)) as {
            album: any;
            original_title?: string;
            artist: { name: string }[];
            explicit: boolean;
        };
    })()

    const getArtist = () => {
        const artistFromURI = player_state.track.metadata.artist_uri ? decodeURIComponent(URIto.id(player_state.track.metadata.artist_uri)).replaceAll("+", " ") : null
        const artistFromPlayer_State = player_state.track.metadata.artist_name
        const artistFromMetadata = trackMetadata.artist
            ? trackMetadata.artist.map((a) => a.name).join(", ")
            : undefined
        return artistFromPlayer_State || artistFromMetadata || artistFromURI
    }

    const getContextName = async () => {
        const subtitle = player_state.track.metadata.station_subtitle;
        const description = player_state.context_metadata?.context_description + (subtitle ? " • " + subtitle : "")
        if (description) return description

        const uriParams = player_state.context_uri?.split(":");
        if (uriParams && uriParams[3] == "collection") return "Liked Songs"
        if (player_state.context_uri == "spotify:internal:local-files") return "Local Files"

        if (!player_state.context_uri) return "UNKNOWN"
        const req = SpotifyClient.getPlaylist(player_state.context_uri)
        if (!req) return player_state.context_uri || "UNKNOWN"

        const playlist = (await req as { name: string })
        return (playlist.name || "") + (subtitle ? " • " + subtitle : "")
    }

    const title = trackMetadata.original_title || player_state.track.metadata.title

    const getSongImage = () => {
        const imageURIFromState = player_state.track.metadata.image_large_url;
        const imageURLFromState = imageURIFromState ? URIto.url(imageURIFromState) : null
        const isStateImageLink = imageURIFromState ? imageURIFromState.startsWith("http") : null
        const fallbackImage =
            "https://i.scdn.co/image/" +
            (!(trackMetadata.album === undefined)
                ? trackMetadata.album.cover_group.image[0].file_id
                : "");
        var albImgUrl = fallbackImage;
        if (imageURIFromState) albImgUrl = isStateImageLink ? imageURIFromState : imageURLFromState;
        return albImgUrl
    }
    const device = state?.devices ? state.devices[state.active_device_id] : undefined;

    const getLikedStatus = async () => {
        if (player_state.track.uri.includes("local")) return true
        const req = await SpotifyClient.trackContains(player_state.track.uri) as { data: { lookup: { data: { isCurated: boolean } }[] } }
        return req.data.lookup[0].data.isCurated
    }

    const changedState: SongState = {
        isExplicit: trackMetadata.explicit || false,
        isSaved: await getLikedStatus(),
        deviceId: state.active_device_id,
        deviceText: device ? device.audio_output_device_info?.device_name || device.name : "",
        contextName: await getContextName(),
        title,
        artist: getArtist(),
        image: getSongImage(),
        duration: parseInt(player_state.duration),
        queue: (await getQueue()),
        options: player_state.options,
        uris: {
            album: player_state.track.metadata.album_uri,
            song: player_state.track.uri
        }
    };

    if (player_state.track.metadata["source-loader"])
        console.log(player_state.track.metadata["source-loader"]);

    return changedState
}