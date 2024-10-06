const api = "https://api.spotify.com/v1";
const api_partner = "https://api-partner.spotify.com";
const spclient_wg = "https://spclient.wg.spotify.com";

interface lyrLine {
    StartTime: Number;
    EndTime: Number;
    Text: String;
}

const timeToMs = (timeStr: string) => {
    let parts = timeStr.split(":");
    let minutes = parseFloat(parts[0]);
    let seconds = parseFloat(parts[1]);
    return (minutes * 60 + seconds) * 1000;
}

var cache: { [key: string]: any } = {
    colors: {},
    metadata: {},
    playlist: {},
}


export const URIto = {
    id: (uri: string) => {
        return uri.split(":")[2];
    },
    url: (uri: string) => {
        const uriParams = uri.split(":");
        const type = uriParams[1];
        switch (type) {
            case "image":
                return "https://i.scdn.co/image/" + uriParams[2];
            case "artist":
                return "https://api.spotify.com/v1/artists/" + uriParams[2];
            case "album":
                return "https://api.spotify.com/v1/albums/" + uriParams[2];
            case "track":
                return "https://api.spotify.com/v1/tracks/" + uriParams[2];
            case "playlist":
                return `https://api.spotify.com/v1/playlists/${uriParams[2]}?.fields=name%2C+images`;
        }
    },
};

//#region Lyrics Get
export const fetchLyrics = {
    "beautifulLyrics": (Spotify: Spotify, uri: string) => {
        if (uri.includes("local")) return
        const id = URIto.id(uri)
        const url = "https://beautiful-lyrics.socalifornian.live/lyrics/" + id;
        return Spotify.makeRequest(url, { withProxy: true }) as any
    },
    "Musixmatch": (mxm: Musixmatch, title: string, artist: string) => {
        return new Promise((res, rej) => {
            mxm.searchSong(title, artist).then(async (searchRes: any) => {
                if (!searchRes) return res([])
                const searchBody = searchRes?.message.body
                if (!searchBody) return res([])
                const firstResult = searchBody.track_list[0]
                if (!firstResult) return res([])
                const trackId = firstResult.track.track_id

                const lyricRes = await mxm.getSubtitle(trackId) as any
                const lyricBody = lyricRes.message.body
                if (!lyricBody) return res([])
                const lyric = lyricBody.subtitle
                if (!lyric) return res([])

                const lyr = lyric.subtitle_body.split("\n");
                var result = lyr.map((line: string, index: number, array: any[]) => {
                    let timeMatch = line.match(/\[(.*?)\]/);
                    if (!timeMatch) return null;

                    let startTime = timeToMs(timeMatch[1]);
                    let text = line.replace(/\[.*?\]/, '').trim();


                    let endTime;
                    if (index < array.length - 1) {
                        let nextTimeMatch =
                            array[index + 1].match(/\[(.*?)\]/);
                        if (nextTimeMatch)
                            endTime = timeToMs(nextTimeMatch[1]);
                        else endTime = Infinity;
                    } else endTime = startTime;

                    return {
                        StartTime: startTime,
                        EndTime: endTime,
                        Text: text,
                    };
                });
                result = result
                    .filter((item: lyrLine) => item !== null)
                return res({ lyrics: result, copyright: lyric.lyrics_copyright })
            })
        })
    },
    "netease": (identifier: string) => {
        return new Promise((res, rej) => {
            const url =
                "https://music.xianqiao.wang/neteaseapiv2/search?limit=10&type=1&keywords=";
            fetch("/api/proxy/" + encodeURIComponent(url + identifier))
                .then((d) => d.json())
                .then(async (data) => {
                    if (!data.result || !data.result.songs) return res([]);
                    const id = data.result.songs[0].id;

                    const url = "https://music.xianqiao.wang/neteaseapiv2/lyric?id=";
                    const lyricRes = await fetch("/api/proxy/" + encodeURIComponent(url + id)).then((d) => d.json())
                    const lyr = lyricRes.lrc.lyric.split("\n");
                    var result = lyr.map((line: string, index: number, array: any[]) => {
                        let timeMatch = line.match(/\[(.*?)\]/);
                        if (!timeMatch) return null;

                        let startTime = timeToMs(timeMatch[1]);
                        let text = line.replace(/\[.*?\]/, '').trim();


                        let endTime;
                        if (index < array.length - 1) {
                            let nextTimeMatch =
                                array[index + 1].match(/\[(.*?)\]/);
                            if (nextTimeMatch)
                                endTime = timeToMs(nextTimeMatch[1]);
                            else endTime = Infinity;
                        } else endTime = startTime;

                        return {
                            StartTime: startTime,
                            EndTime: endTime,
                            Text: text,
                        };
                    });
                    result = result
                        .filter((item: lyrLine) => item !== null)
                        .filter(
                            (item: lyrLine) =>
                                !item.Text.includes("作词") &&
                                !item.Text.includes("编曲") &&
                                !item.Text.includes("作曲") &&
                                !item.Text.includes("纯音乐，请欣赏")
                        );

                    return res(result);
                });
        });
    },
    "spotify": (Spotify: Spotify, uri: string) => {
        return new Promise((res, rej) => {
            Spotify.getLyrics(uri).then((lyr: any) => {

                if (lyr.lyrics.syncType !== "LINE_SYNCED") return res([])
                const resu = lyr.lyrics.lines.map((line: any, index: number, array: any[]) => {
                    const startTime = line.startTimeMs

                    let endTime;
                    if (index < array.length - 1) {
                        if (array[index + 1])
                            endTime = array[index + 1].startTimeMs
                        else endTime = Infinity;
                    } else endTime = startTime;

                    return {
                        StartTime: startTime,
                        EndTime: endTime,
                        Text: line.words == "♪" ? "" : line.words
                    };
                })

                res(resu)
            }).catch(err => { res([]) })
        })
    }
}


//#region Musixmatch Class
export class Musixmatch {
    user_token: string
    constructor() {
        this.user_token = ""
        this.newSession()
    }
    async makeRequest(url: string, query?: string, method?: "GET" | "POST" | "PUT" | "DELETE") {
        if (this.user_token === "") return
        const _url = "/api/proxy/" + encodeURIComponent(url) + `?usertoken=${this.user_token}&app_id=web-desktop-app-v1.0&${query}`
        return new Promise((resp, rej) => {
            const defaultOptions = {
                method: method || "GET",
                url: _url
            };

            fetch(_url, defaultOptions)
                .then((data) => data.json())
                .then((resApi) => resp(resApi))
                .catch((err) => {
                    if (!err.response) return resp(err);
                    if (err.response.status == 404) return resp(err);
                    if (err.response.status !== 401) return resp(err);
                    window.location.href = window.location.href
                });
        });
    }
    newSession() {
        return new Promise((resp, rej) => {
            fetch("/api/session-mxm")
                .then((data) => data.json())
                .then((res: any) => {
                    if (!res.message.body) return rej("nobody")
                    this.user_token = res.message.body.user_token;
                    console.info("Musixmatch session generated. Token: ", this.user_token);
                    return resp(res);
                })
                .catch((err) => {
                    alert("err");
                    console.log(err);
                });
        });
    }
    searchSong(title: string, artist: string) {
        const _search = "https://apic-desktop.musixmatch.com/ws/1.1/track.search"
        return this.makeRequest(_search, `q_track=${encodeURIComponent(title)}&q_artist=${encodeURIComponent(artist)}`)
    }
    getSubtitle(trackId: number) {
        const _search = "https://apic-desktop.musixmatch.com/ws/1.1/track.subtitle.get"
        return this.makeRequest(_search, `track_id=${trackId}`)
    }
}

//#region Sporify Class
export class Spotify {
    session: {
        accessToken: string,
        accessTokenExpirationTimestampMs: number,
        isAnonymous: boolean,
        clientId: string,
    }
    ready: () => any
    constructor() {
        this.session = {
            accessToken: "",
            accessTokenExpirationTimestampMs: 0,
            isAnonymous: false,
            clientId: "",
        };
        this.ready = () => console.error("no ready event");
        this.newSession();

    }
    async makeRequest(url: string, options?: {
        method?: "GET" | "POST" | "PUT" | "DELETE";
        withProxy?: boolean,
        body?: string
    }) {
        if (!this.session.accessToken) return { err: "Not Ready" };
        if (options?.withProxy) url = "/api/proxy/" + encodeURIComponent(url)
        return new Promise((resp, rej) => {
            const defaultOptions = {
                method: options?.method || "GET",
                url: url,
                body: options?.body,
                params: { format: "json" },
                headers: {
                    "app-platform": "WebPlayer",
                    authorization: `Bearer ${this.session.accessToken}`,
                    Accept: "application/json",
                    "Content-Type": options?.body ? "application/json" : ""
                },
            };
            fetch(url, defaultOptions)
                .then((data) => data.json())
                .then((resApi) => {
                    resp(resApi);
                })
                .catch((err) => {
                    if (!err.response) {
                        resp(undefined);
                        return;
                    }
                    if (err.response.status == 404) {
                        resp({ err: "Not Found" });
                        return;
                    }
                    if (err.response.status !== 401) {
                        alert("Token Expired")
                        resp({ err: "Token Expired" })
                        return;
                    }

                    resp({ err });
                    console.log({ err });
                });
        });
    }
    operation(operationName: "editablePlaylists" | "isCurated" | "decorateContextTracks" | "fetchExtractedColors" | "canvas" | "libraryV3", variables: any) {
        const encode = (str: any) => encodeURIComponent(JSON.stringify(str))
        const hashes = {
            "editablePlaylists": "acb5390f2929bdcad4c6afe1c08bdbe09375f50fdb29d75244f67e9aee77ebc4",
            "isCurated": "e4ed1f91a2cc5415befedb85acf8671dc1a4bf3ca1a5b945a6386101a22e28a6",
            "decorateContextTracks": "8b8d939c5d6da65a3f1b9fbaa96106b27fd6ff1ae7205846d9de3ffbee3298ee",
            "fetchExtractedColors": "86bdf61bb598ee07dc85d6c3456d9c88eb94f33178509ddc9b33fc9710aa9e9c",
            "canvas": "1b1e1915481c99f4349af88268c6b49a2b601cf0db7bca8749b5dd75088486fc",
            "libraryV3": "e25e473b160efdd4ababa7d98aa909ce0e5ab9c49c81f6d040da077a09e34ab3"
        }

        const varables = encode(variables)
        const ext = encode({ "persistedQuery": { "version": 1, "sha256Hash": hashes[operationName] } })
        const params = `operationName=${operationName}&variables=${varables}&extensions=${ext}`
        const url = `${api_partner}/pathfinder/v1/query?${params}`
        return this.makeRequest(url)
    }

    //#region Connection
    newSession() {
        return new Promise((resp, rej) => {
            fetch("/api/session")
                .then((data) => data.json())
                .then((res) => {
                    if (res.offline) return alert("Offline");
                    if (res.accessToken == "") return alert("Error No Access Token");

                    this.session = res;
                    this.ready();
                    console.info("Spotify session generated. Token: ", this.session.accessToken);
                    return resp(res);
                })
                .catch((err) => {
                    alert("err");
                    console.log(err);
                });
        });
    }
    async connectWs(connection_id: string) {
        const deviceID = randomID();
        const accessToken = this.session.accessToken
        return await connectState(connection_id, deviceID, accessToken);

        function randomID() {
            var digits = function (length: number) {
                var bytes = crypto.getRandomValues(new Uint8Array(length));
                var str = "";
                for (var i = 0; i < bytes.length; i++) {
                    str += bytes[i].toString(16);
                }
                return str;
            };
            return (
                digits(4) + "-" + digits(2) + "-" + digits(2) + "-" + digits(2) + "-" + digits(6)
            );
        }

        async function connectState(connection_id: string, device_id: string, accessToken: string) {
            let headersList = {
                "x-spotify-connection-id": connection_id,
                authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            };

            let bodyContent = JSON.stringify({
                member_type: "CONNECT_STATE",
                device: {
                    device_info: {
                        capabilities: {
                            can_be_player: false,
                            hidden: true,
                            needs_full_player_state: true,
                        },
                    },
                },
            });

            let reqOptions = {
                method: "PUT",
                headers: headersList,
                body: bodyContent,
            };
            const request = await fetch(
                `https://spclient.wg.spotify.com/connect-state/v1/devices/hobs_${device_id}`,
                reqOptions
            ).then((d) => d.json());
            return request;
        }
    }


    //#region Me
    getMe() { return this.makeRequest(api + "/me") }
    getPlayer() { return this.makeRequest(api + "/me/player") }
    setDevice(deviceId: string) {
        return this.makeRequest(api + "/me/player", {
            method: "PUT", body: JSON.stringify({ "device_ids": [deviceId] })
        })

    }
    getQueue() { return this.makeRequest(api + "/me/player/queue") }
    async SeekTo(position_ms: number) {
        return this.makeRequest(api + "/me/player/seek?position_ms=" + position_ms.toString(), { method: "PUT" });
    }
    getLibrary() {
        return this.operation("libraryV3", {
            "filters": [],
            "order": null,
            "textFilter": "",
            "features": ["LIKED_SONGS", "YOUR_EPISODES"],
            "limit": 50,
            "offset": 0,
            "flatten": false,
            "expandedFolders": [],
            "folderUri": null,
            "includeFoldersWhenFlattening": true
        })
    }

    //#region Playlists
    async getEditablePlaylists(uris: string[], folderUri?: string) {
        const varables = { "offset": 0, "limit": 50, "textFilter": "", uris, folderUri }
        return this.operation("editablePlaylists", varables)
    }
    getPlaylist(uri: string) {
        if (cache["playlist"][uri]) return cache["playlist"][uri]

        const playlistUrl = URIto.url(uri);
        if (!playlistUrl) return
        const req = this.makeRequest(playlistUrl)
        cache["playlist"][uri] = req
        return req
    }
    appendToPlaylist(playlistUri: string, trackUri: string) {
        return this.makeRequest(api + `/playlists/${playlistUri}/tracks`, { method: "POST", body: JSON.stringify({ uris: [trackUri] }) });
    }
    removeFromPlaylist(playlistUri: string, trackUri: string) {
        return this.makeRequest(api + `/playlists/${playlistUri}/tracks`, { method: "DELETE", body: JSON.stringify({ tracks: [{ uri: trackUri }] }) });
    }

    //#region Saved tracks (Liked)
    saveTrack(trackUri: string) {
        const id = URIto.id(trackUri)
        return this.makeRequest(api + `/me/tracks`, { method: "PUT", body: JSON.stringify({ ids: [id] }) });
    }
    removeSavedTrack(trackUri: string) {
        const id = URIto.id(trackUri)
        return this.makeRequest(api + `/me/tracks`, { method: "DELETE", body: JSON.stringify({ ids: [id] }) });
    }
    trackContains(uri: string) {
        const varables = { "uris": [uri] }
        return this.operation("isCurated", varables)
    }

    //#region Tracks
    getTrack(id: string) { return this.makeRequest(api + "/tracks/" + id); }
    getTrackMetadata(trackId: string) {
        if (cache["metadata"][trackId]) return cache["metadata"][trackId]

        const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let val = BigInt("0");
        for (let i = 0; i < trackId.length; i++) {
            let digit = alphabet.indexOf(trackId.charAt(i));
            val = val * BigInt("62") + BigInt(digit);
        }
        const gid = val.toString(16).padStart(32, "0");
        const url = `https://spclient.wg.spotify.com/metadata/4/track/${gid}`
        const req = this.makeRequest(url);
        cache["metadata"][trackId] = req
        return req
    }

    //#region Design
    getCanvas(uri: string) { return this.operation("canvas", { uri }) }
    decorateTracks(uris: string[]) { return this.operation("decorateContextTracks", { uris }) }
    getLyrics(uri: string) {
        const id = URIto.id(uri)

        const url = `${spclient_wg}/color-lyrics/v2/track/${id}/image/noimagejustlyrics?format=json`;
        return this.makeRequest(url, { withProxy: true });
    }
    async getColors(albSrc: string | undefined) {
        const def = { colorDark: { hex: "" }, colorLight: { hex: "" }, };
        if (!albSrc) return def

        const url = albSrc.startsWith("spotify") ? (URIto.url(albSrc) as string) : albSrc;
        if (!url) return def;

        if (cache["colors"][albSrc]) return cache["colors"][albSrc]

        const req = this.operation("fetchExtractedColors", { uris: [url] })
        cache["colors"][albSrc] = req

        return req

    }

    //#region Playback
    async SkipTo({ active_device_id, uri, uid }: { active_device_id: string | undefined, uri: string, uid: string }) {
        const raw = JSON.stringify({
            "command": {
                "logging_params": {
                    "page_instance_ids": [],
                    "interaction_ids": [],
                    "command_id": "a766757ef6b622b97d3a1131a6fac93b"
                },
                "track": {
                    uri, uid,
                    "provider": "context"
                },
                "endpoint": "skip_next"
            }
        });
        const _host = "https://gae2-spclient.spotify.com"
        return this.makeRequest(_host + `/connect-state/v1/player/command/from/0/to/${active_device_id}`, { method: "POST", body: raw });
    }

    async playback(mode: "pause" | "play" | "skipNext" | "skipPrev" | "shuffle" | "repeat", options?: any) {
        switch (mode) {
            case "pause":
                return this.makeRequest(api + "/me/player/pause", { method: "PUT" });
            case "play":
                return this.makeRequest(api + "/me/player/play", { method: "PUT" });
            case "skipNext":
                return this.makeRequest(api + "/me/player/next", { method: "POST" });
            case "skipPrev":
                return this.makeRequest(api + "/me/player/previous", { method: "POST" });
            case "shuffle":
                return this.makeRequest(api + `/me/player/shuffle?state=${options}`, { method: "PUT" });
            case "repeat":
                return this.makeRequest(api + `/me/player/repeat?state=${options}`, { method: "PUT" });
            default:
                break;
        }
    }
};