import { NextRequest } from 'next/server';
import * as extractColors from "extract-colors"
const getPixels = require("get-pixels")
async function handler(
    req: NextRequest,
    { params }: { params: { url: string } }
) {
    try {

        const url = decodeURIComponent(params.url)
        const data = new Promise((req, rej) => {
            getPixels(url, (err: any, pixels: any) => {
                if (!err) {
                    const data = [...pixels.data];
                    const [width, height] = pixels.shape;

                    extractColors.extractColors({ data, width, height }).then(req).catch(rej);
                }
            });
        })

        return Response.json((await data as any).map((d: any) => ({ r: d.red, g: d.green, b: d.blue })))
    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };