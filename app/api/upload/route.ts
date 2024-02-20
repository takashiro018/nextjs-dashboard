import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('image_url') as unknown as File

    console.log(data);

    if (!file) {
        return NextResponse.json({ success: false })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll just write it to the filesystem in a new location
    const path = `/customers/${file.name}`
    await writeFile(path, buffer)
    console.log(`open ${path} to see the uploaded file`)

    return NextResponse.json({ success: true })
}