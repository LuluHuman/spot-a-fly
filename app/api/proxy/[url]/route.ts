import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { NextRequest } from 'next/server';
import { CookieJar } from 'tough-cookie';

async function handler(
    req: NextRequest,
    { params }: { params: { url: string } }
) {
    try {

        const url = decodeURIComponent(params.url)
        const data = await req.text()
        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));
        const request = await client(url, {
            method: req.method,
            headers: {
                "app-platform": "WebPlayer",
                authorization: req.headers.get("authorization"),
                Accept: "application/json",
                "Content-Type": req.headers.get("Content-Type")
            },
            data: data == "{}" ? undefined : data,
            params: req.nextUrl.searchParams,
        })

        return Response.json(request.data, { status: request.status })
    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };