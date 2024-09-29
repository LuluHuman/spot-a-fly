export interface SpotifyWebhook {
    headers: {
        "content-type": string;
        "Spotify-Connection-Id"?: string
    };
    payloads: Payload[];
    type: string;
    uri: string;
}

export interface Payload {
    cluster: Cluster;
    update_reason: string;
    devices_that_changed: string[];
}

export interface Cluster {
    timestamp: string;
    active_device_id: string;
    player_state: PlayerState;
    devices: {
        [key: string]: Device;
    };
    transfer_data_timestamp: string;
    not_playing_since_timestamp: string;
    need_full_player_state: boolean;
    server_timestamp_ms: string;
    needs_state_updates: boolean;
    started_playing_at: string;
}

export interface PlayerState {
    timestamp: string;
    context_uri: string;
    context_url: string;
    context_restrictions: Record<string, unknown>;
    play_origin: PlayOrigin;
    index: TrackIndex;
    track: Track;
    playback_id: string;
    playback_speed: number;
    position_as_of_timestamp: string;
    duration: string;
    is_playing: boolean;
    is_paused: boolean;
    is_system_initiated: boolean;
    options: PlaybackOptions;
    restrictions: Restrictions;
    suppressions: Record<string, unknown>;
    prev_tracks: Track[];
    next_tracks: Track[];
    context_metadata: ContextMetadata;
    page_metadata: Record<string, unknown>;
    session_id: string;
    queue_revision: string;
    playback_quality: PlaybackQuality;
    signals: string[];
}

export interface PlayOrigin {
    feature_identifier: string;
    feature_version: string;
    referrer_identifier: string;
}

export interface TrackIndex {
    page: number;
    track: number;
}

export interface Track {
    uri: string;
    uid: string;
    metadata: Metadata | any;
    provider: string;
}

export interface Metadata {
    title: string;
    original_index: string;
    "actions.skipping_prev_past_track": string;
    context_uri: string;
    entity_uri: string;
    image_xlarge_url: string;
    artist_uri: string;
    track_player: string;
    "actions.skipping_next_past_track": string;
    image_url: string;
    ORIGINAL_SESSION_ID: string;
    image_small_url: string;
    album_uri: string;
    image_large_url: string;
    album_title: string;
    iteration: string;
}

export interface PlaybackOptions {
    shuffling_context: boolean;
    repeating_context: boolean;
    repeating_track: boolean;
}

export interface Restrictions {
    disallow_pausing_reasons: string[];
    disallow_setting_playback_speed_reasons: string[];
}

export interface ContextMetadata {
    playlist_number_of_tracks: string;
    context_description: string;
    image_url: string;
    "sorting.criteria": string;
    playlist_number_of_episodes: string;
    context_owner: string;
    "player.arch": string;
}

export interface PlaybackQuality {
    bitrate_level: string;
    strategy: string;
    target_bitrate_level: string;
    target_bitrate_available: boolean;
}

export interface Device {
    can_play: boolean;
    volume: number;
    name: string;
    capabilities: Capabilities;
    device_software_version: string;
    device_type: string;
    device_id: string;
    client_id: string;
    brand: string;
    model: string;
    public_ip: string;
    spirc_version?: string;
    metadata_map?: MetadataMap;
    license?: string;
    audio_output_device_info?: AudioOutputDeviceInfo;
}

export interface Capabilities {
    supports_logout: boolean;
    is_observable: boolean;
    volume_steps: number;
    supported_types: string[];
    supports_playlist_v2: boolean;
    supports_external_episodes: boolean;
    supports_command_request: boolean;
    supports_set_options_command: boolean;
    supports_hifi?: Record<string, unknown>;
    can_be_player?: boolean;
    gaia_eq_connect_id?: boolean;
    command_acks?: boolean;
    supports_rename?: boolean;
    is_controllable?: boolean;
    supports_set_backend_metadata?: boolean;
    supports_transfer_command?: boolean;
    supports_gzip_pushes?: boolean;
    supports_dj?: boolean;
}

export interface MetadataMap {
    debug_level: string;
    device_address_mask: string;
    tier1_port: string;
}

export interface AudioOutputDeviceInfo {
    audio_output_device_type: string;
    device_name: string;
}

export interface NextTrack {
    __typename?: "Track",
    provider: string,
    albumOfTrack: {
        coverArt: {
            sources: {
                height: number,
                url: string,
                width: number,
            }[]
        },
        name: string,
        uri: string,
    },
    artists: {
        items: [
            {
                profile: { name: string },
                uri: string,
            },
        ],
    },
    contentRating: { label: string },
    name: string,
    uri: string,
    uid: string,
}

export interface NextTracks {
    data: {
        tracks: NextTrack[]
    }
};


export interface SongState {
    isExplicit: boolean;
    isSaved: boolean;
    deviceId?: string
    deviceText?: string;
    contextName: string;
    title: string;
    artist: string;
    image: string;
    duration: number;
    queue: NextTrack[];
    options: {
        repeating_context: boolean,
        repeating_track: boolean,
        shuffling_context: boolean;
    },
    uris: {
        album: string,
        song: string
    }
}

export interface sylLine {
    msStart: number;
    msEnd: number;
    element: React.JSX.Element | string;
}

export interface Lyrics {
    msStart: number;
    msEnd: number;
    i?: number;
    isInstrumental?: boolean;
    isOppositeAligned?: boolean;
    isBackground?: boolean;
    element: React.JSX.Element;
    children?: sylLine[];
}

export interface EditablePlaylist {
    "data": {
        "me": {
            "editablePlaylists": {
                "__typename": "EditablePlaylistPage",
                "items":
                {
                    "curates": boolean,
                    "item": {
                        "__typename": "PlaylistResponseWrapper" | "LibraryPseudoPlaylistResponseWrapper",
                        "_uri": string,
                        "data": {
                            "__typename": "Playlist" | "PseudoPlaylist" | "Folder",
                            "images": {
                                "items": [
                                    {
                                        "extractedColors": {
                                            "colorDark": {
                                                "hex": string,
                                                "isFallback": boolean
                                            }
                                        },
                                        "sources": [
                                            {
                                                "height": number,
                                                "url": string,
                                                "width": number
                                            }
                                        ]
                                    }
                                ]
                            },
                            "image": {
                                "extractedColors": {
                                    "colorDark": {
                                        "hex": string,
                                        "isFallback": boolean
                                    }
                                },
                                "sources": [
                                    {
                                        "height": number,
                                        "url": string,
                                        "width": number
                                    }
                                ]
                            },
                            "name": string,
                            "uri": string
                        }
                    },
                    "pinned": boolean
                }[],
                "pagingInfo": {
                    "limit": number,
                    "offset": number
                },
                "totalCount": number
            }
        }
    },
    "extensions": {}
}