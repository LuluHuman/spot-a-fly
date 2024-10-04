import { Spotify, URIto } from "./api";
import { PlayerState, SongStateExtra, Cluster, NextTracks, NextTrack, SongState } from "./types";

const blank =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAtJREFUCJljYAACAAAFAAFiVTKIAAAAAElFTkSuQmCC";

var LastUpdate: any = {}
var LastState = {
    queue_revision: "",
    trackUri: ""
}

export async function collectStateExtra(
    SpotifyClient: Spotify,
    state: Cluster,
) {
    const player_state = (state?.player_state || state) as PlayerState;

    const getCanvas = async () => {
        if (!player_state.track.uri.startsWith("spotify:track")) return undefined
        const canvasReq = await SpotifyClient.getCanvas(player_state.track.uri) as any
        const canvas = canvasReq.data.trackUnion.canvas
        if (canvas) return canvas.url
        return undefined
    }

    const getQueue = async () => {
        if (player_state.queue_revision == LastState.queue_revision && LastUpdate.queue) return LastUpdate.queue
        LastState.queue_revision = player_state.queue_revision

        const queueArr = []

        const next50Tracks = player_state.next_tracks.slice(0, 50)
        const uris = next50Tracks.map(nextTrack => nextTrack.uri).filter(uri => uri.startsWith("spotify:track"))
        const queue = await SpotifyClient.decorateTracks(uris).then((data) => (data as unknown as NextTracks).data)

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

    const getContextName: () => Promise<SongStateExtra["context"]> = async () => {
        const subtitle = player_state.track.metadata.station_subtitle;

        const descriptionType = player_state.context_uri?.split(":")[1]
        const description = player_state.context_metadata?.context_description

        if (descriptionType == "search") return { header: "PLAYING FROM SEARCH", name: player_state.context_uri?.split(":")[2] }
        if (subtitle) return { header: "DJ", name: subtitle }
        if (description) return { header: `PLAYING FROM ${descriptionType.toUpperCase()}`, name: description }

        const uriParams = player_state.context_uri?.split(":");

        if (uriParams && uriParams[3] == "collection") return { header: "PLAYING FROM YOUR LIBRARY", name: "Liked Songs" }
        if (player_state.context_uri == "spotify:internal:local-files") return { header: "PLAYING FROM YOUR LIBRARY", name: "Local Files" }
        if (!player_state.context_uri) return { header: "PLAYING FROM", name: player_state.track.metadata.album_title }

        const req = SpotifyClient.getPlaylist(player_state.context_uri)
        if (!req) return { header: "PLAYING FROM", name: player_state.context_uri }
        return { header: "", name: "" }
    }

    const getLikedStatus = async () => {
        if (player_state.track.uri.includes("local")) return true
        const req = await SpotifyClient.trackContains(player_state.track.uri) as { data: { lookup: { data: { isCurated: boolean } }[] } }
        if (!req.data || !req.data.lookup[0].data) return LastUpdate.isSaved || false
        return req.data.lookup[0].data.isCurated
    }

    const [canvasUrl, isSaved, context, queue] = await Promise.all([getCanvas(), getLikedStatus(), getContextName(), getQueue()])
    const changedState: SongStateExtra = { canvasUrl, isSaved, context, queue };

    if (player_state.track.metadata["source-loader"])
        console.log(player_state.track.metadata["source-loader"]);

    LastUpdate = changedState
    return changedState
}

export async function collectState(
    trackId: string,
    SpotifyClient: Spotify,
    state: Cluster,
) {
    const player_state = (state?.player_state || state) as PlayerState;

    async function getTrackMetadata() {
        LastState.trackUri == player_state.track.uri
        if (player_state.track.uri.includes("local")) return { album: undefined, original_title: undefined, explicit: undefined, artist: undefined }
        return (await SpotifyClient.getTrackMetadata(trackId)) as {
            album: any;
            original_title?: string;
            artist: { name: string }[];
            explicit: boolean;
        };
    }

    const trackMetadata = player_state.track.uri == LastState.trackUri ? undefined : await getTrackMetadata()

    const getArtist = () => {
        if (!trackMetadata) return LastUpdate.artist
        const artistFromURI = player_state.track.metadata.artist_uri ? decodeURIComponent(URIto.id(player_state.track.metadata.artist_uri)).replaceAll("+", " ") : null
        const artistFromPlayer_State = player_state.track.metadata.artist_name
        const artistFromMetadata = trackMetadata.artist
            ? trackMetadata.artist.map((a) => a.name).join(", ")
            : undefined
        return artistFromPlayer_State || artistFromMetadata || artistFromURI || player_state.track.metadata.artist_uri
    }

    const title = trackMetadata?.original_title || player_state.track.metadata.title

    const getSongImage = () => {
        if (!trackMetadata) return LastUpdate.image
        const imageURIFromState = player_state.track.metadata.image_large_url;
        const imageURLFromState = imageURIFromState ? URIto.url(imageURIFromState) : null
        const isStateImageLink = imageURIFromState ? imageURIFromState.startsWith("http") : null

        const fileID = trackMetadata.album?.cover_group.image[0].file_id
        const fallbackImage = fileID ?
            "https://i.scdn.co/image/" + trackMetadata.album?.cover_group.image[0].file_id : undefined
        var albImgUrl = fallbackImage;
        if (imageURIFromState && imageURLFromState) albImgUrl = isStateImageLink ? imageURIFromState : imageURLFromState;
        return albImgUrl
    }
    const device = state?.devices ? state.devices[state.active_device_id] : undefined;

    const changedState: SongState = {
        isExplicit: (trackMetadata ? trackMetadata.explicit : LastUpdate.isExplicit) || false,
        deviceId: state.active_device_id,
        deviceText: device ? device.audio_output_device_info?.device_name || device.name : "",
        title,
        artist: getArtist(),
        image: getSongImage(),
        duration: parseInt(player_state.duration),
        options: player_state.options,
        uris: {
            album: player_state.track.metadata.album_uri,
            song: player_state.track.uri
        }
    };

    if (player_state.track.metadata["source-loader"])
        console.log(player_state.track.metadata["source-loader"]);

    LastUpdate = changedState
    return changedState
}