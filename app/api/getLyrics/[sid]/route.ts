import fs from "fs"
import { NextRequest } from "next/server";
import path from "path";
async function handler(
    req: NextRequest,
    { params }: { params: { sid: string } }
) {
    try {

        const sid = decodeURIComponent(params.sid)
        const file = path.join(process.cwd(), "lyrics", sid + ".json")
        if (fs.existsSync(file)) return Response.json(JSON.parse(fs.readFileSync(file, "utf8")))
        return Response.json("")


    } catch (err: any) {
        return Response.json({ err }, { status: err.status || 500 })
    }
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };