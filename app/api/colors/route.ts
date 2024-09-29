import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const api_partner = "https://api-partner.spotify.com";
    const url = `${api_partner}/pathfinder/v1/query`;
    const auth = req.headers.get('authorization');

    try {
        const response = await axios.get(url, {
            headers: {
                'app-platform': 'WebPlayer',
                'authorization': auth || '',
                'Accept': 'application/json',
            },
            params: req.nextUrl.searchParams,
        });

        return NextResponse.json(response.data);
    } catch (err) {
        return NextResponse.json({ err: err }, { status: 500 });
    }
}
