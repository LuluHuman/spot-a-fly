import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Spot-a-fly',
        short_name: 'SpotAFly',
        description: 'A redesigned version of the spotify mobile app with better lyric support',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/images/icon.png',
                sizes: '667x667',
                type: 'image/png',
            },
            {
                src: '/images/icon144.png',
                sizes: '144x144',
                type: 'image/png',
            },
            {
                src: '/images/icon512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}