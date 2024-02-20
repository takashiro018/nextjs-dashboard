import mime from "mime";
import { join } from "path";
import { stat, writeFile } from "fs/promises";
//import * as dateFn from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const file = formData.get('image_url') as Blob | null;
    if (!file) {
        return NextResponse.json(
            { error: "File blob is required." },
            { status: 400 }
        );
    }

    console.log(formData);
    console.log(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const relativeUploadDir = `/customers/`;
    const uploadDir = join(process.cwd(), "public", relativeUploadDir);

    console.log(buffer);
    console.log(relativeUploadDir);
    console.log(uploadDir);
    /*try {
        //const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        //const filename = `${file.replace(
            /\.[^/.]+$/,
            ""
        //)}.${mime.getExtension(file.type)}`;
        console.log(filename);
        await writeFile(`${uploadDir}/${filename}`, buffer);
        return NextResponse.json({ fileUrl: `${relativeUploadDir}/${filename}` });
    } catch (e) {
        console.error("Error while trying to upload a file\n", e);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }*/
}