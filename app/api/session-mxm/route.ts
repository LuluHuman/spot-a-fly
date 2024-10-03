import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export const dynamic = 'force-static'
export async function GET() {
    const tokenURL = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0";
    try {

        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));
        const tokenReq = await client.get(tokenURL)
        return Response.json(tokenReq.data);

    } catch (err: any) { return Response.json({ err }, { status: err.status || 500 }) }
}