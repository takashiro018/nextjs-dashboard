import { IncomingForm } from 'formidable'
import { promises as fs } from 'fs'
import { IncomingMessage } from 'http';
import { NextRequest, NextResponse } from 'next/server'

var mv = require('mv');

export const config = {
    api: {
        bodyParser: false,
    }
};

export default async (NextRequest: IncomingMessage, NextResponse: any) => {

    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm()

        form.parse(NextRequest, (err, fields, files) => {
            if (err) return reject(err)
            console.log(fields, files)
            //console.log(files.file.filepath)
            //var oldPath = files.file.filepath;
            //var newPath = `./public/uploads/${files.file.originalFilename}`;
            //mv(oldPath, newPath, function(err: any) {
            // });
            //NextResponse.status(200).json({ fields, files })
        })
    })
}