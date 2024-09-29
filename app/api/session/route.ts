import axios from 'axios';
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = cookies()
    const sp_dc = cookieStore.get("sp_dc")
    console.log(sp_dc);

    const tokenURL = "https://open.spotify.com/get_access_token";
    try {
        const tokenReq = await axios.get(tokenURL, sp_dc ? { headers: { Cookie: `sp_dc=${sp_dc.value};` } } : undefined)
        return Response.json(tokenReq.data);
    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}
export async function POST(req: Request) {
    const data = await req.json()
    const cookieStore = cookies()
    const sp_dc = cookieStore.set({
        name: "sp_dc", value: data.session, httpOnly: true
    })
    console.log(sp_dc);

    const tokenURL = "https://open.spotify.com/get_access_token";
    try {
        const tokenReq = await axios.get(tokenURL, sp_dc ? { headers: { Cookie: `sp_dc=${sp_dc};` } } : undefined)
        return Response.json(tokenReq.data);
    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}