import axios from 'axios';
import { cookies } from 'next/headers'
import { TOTP } from "totp-generator"

export async function GET() {
    const cookieStore = cookies()
    const sp_dc = cookieStore.get("sp_dc")

    const { otp } = TOTP.generate("GU2TANZRGQ2TQNJTGQ4DONBZHE2TSMRSGQ4DMMZQGMZDSMZUG4")
    const tspmo = new Date().getTime()
    const tokenURL = `https://open.spotify.com/get_access_token?reason=init&productType=web-player&totp=${otp}&totpVer=5&ts=${tspmo}`;
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

    const { otp } = TOTP.generate("GU2TANZRGQ2TQNJTGQ4DONBZHE2TSMRSGQ4DMMZQGMZDSMZUG4")
    const tspmo = new Date().getTime()
    const tokenURL = `https://open.spotify.com/get_access_token?reason=init&productType=web-player&totp=${otp}&totpVer=5&ts=${tspmo}`;
    try {
        const tokenReq = await axios.get(tokenURL, sp_dc ? { headers: { Cookie: `sp_dc=${sp_dc};` } } : undefined)
        return Response.json(tokenReq.data);
    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}