import { generateTokenUrl } from '@/app/lib/secretGenerator';
import axios from 'axios';
import { cookies } from 'next/headers'
import { TOTP } from "totp-generator"

export async function GET() {
    const cookieStore = cookies()
    const sp_dc = cookieStore.get("sp_dc")
    if (!sp_dc || !sp_dc.value) return Response.json({ err: "No sp_dc cookie" }, { status: 400 })

    return await getToken(sp_dc.value)
}
export async function POST(req: Request) {
    const data = await req.json()
    const cookieStore = cookies()
    const sp_dc =
        cookieStore.set({
            name: "sp_dc",
            value: data.session,
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
        });

    return await getToken(data.session)

}

async function getToken(sp_dc: string) {
    const tokenURL = await generateTokenUrl()
    if (!tokenURL) return Response.json({ err: "cant get token key" }, { status: 500 });
    try {
        const tokenReq = await axios.get(tokenURL, sp_dc ? { headers: { Cookie: `sp_dc=${sp_dc};` } } : undefined)
        return Response.json(tokenReq.data);
    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}