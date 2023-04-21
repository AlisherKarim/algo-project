import decompress from "decompress";
import { NextApiRequest, NextApiResponse } from "next";
import { Amplify, Auth, Storage } from 'aws-amplify';
import awsconfig from '../../aws-exports';
import AdmZip from "adm-zip";
import axios from "axios";
Amplify.configure(awsconfig);

async function get(url) {
  const options =  { 
      method: 'GET',
      url: url,
      responseType: "arraybuffer"
  };
  const { data } = await axios(options);
  return data;
}

export default async (
  req,
  res
) => {
  console.log(req.body)

  const zipFileBuffer = await get(req.body)
  const zip = new AdmZip(zipFileBuffer);
  const entries = zip.getEntries();
  for(let entry of entries) {
    if(entry.entryName != 'manifest.text')
      continue
    const buffer = entry.getData();
    console.log("File: " + entry.entryName + ", length (bytes): " + buffer.length + ", contents: " + buffer.toString("utf-8"));
    res.status(200).json({ data: buffer.toString("utf-8")})
  }
}

