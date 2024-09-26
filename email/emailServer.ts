import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';

import { socksDispatcher } from "fetch-socks";

const dispatcher = socksDispatcher({
  type: 5,
  host: "localhost",
  // host: "::1",
  port: 9050,

  //userId: "username",
  //password: "password",
});


import { gmail_v1, google, GoogleApis } from 'googleapis';
import { decodeBase64Url } from './utils';
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'email/old/token3.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'email/desktopcredentials.json');


/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content.toString());
    console.log(credentials)
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
    console.error('token has expired or doesnt exist')
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content.toString());
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  console.log('no client found!');
  process.exit();
  console.log('authenticating')
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  console.log('authenticated')
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}

async function getEmailAuthed(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  // const res = await gmail.users.messages.list({userId:'bigblackkittenslimy@gmail.com'});
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 1000 });
  const messages = res.data.messages;
  return messages;
}

let auth: any = null;
async function listEmail() {
  if (!auth) auth = await authorize();
  return getEmailAuthed(auth);
}
async function getEmail(id: string) {
  if (!auth) auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });
  // const res = await gmail.users.messages.list({userId:'bigblackkittenslimy@gmail.com'});
  const res = await gmail.users.messages.get({ userId: 'me', id, format: "raw" });
  const messages = res
  return messages;
}

import * as http from 'http';
import { HttpProxyAgent } from 'http-proxy-agent';
import fetch from 'node-fetch'

async function verifyLink(link) {

  // let res = await fetch(link, { dispatcher });
  const agent = torAgent;
  // const agent = new HttpProxyAgent(await Rotator.getMainRotator().getCurrentProxyUrl());
  let res = await fetch(link, { agent });
  console.log('ok', res.ok)
  console.log(res)
  return { ok: res.ok };
}

async function recordId(id: string, ok: boolean) {
  let filename = 'email/clicked/' + sanitize(id)
  await fs.writeFile(filename, JSON.stringify(ok));
}

async function isIdRecorded(id) {
  let filename = 'email/clicked/' + sanitize(id)
  return await fsExists(filename)
}

async function isIdSuccess(id) {
  try {
    let filename = 'email/clicked/' + sanitize(id)
    let recorded = await fsExists(filename);
    if (recorded) {
      let file = await fs.readFile(filename);
      let answer = JSON.parse(file.toString());
      return new Boolean(answer);
    } else {
      return false;
    }
  } catch (e) { 
    console.error(e)
    return false }
}



import sanitize from 'sanitize-filename'
import fsExists from 'fs.promises.exists';
import { file } from 'googleapis/build/src/apis/file';
import Rotator from '../ProxyRotater';
import { torAgent } from '../utils';
async function clickEmail(emailTextContent) {

  const pattern = new RegExp(`https:\\/\\/scratch\\.mit\\.edu\\/accounts\\/email_verify\\/.+\\/`, 'g');

  const matches = emailTextContent.match(pattern);
  if (!matches || !matches.length) return { ok: true };
  const link = matches[0]
  console.log(link)

  if (!link) return { ok: true };

  // let resp = await fetch(link);
  let ok = await verifyLink(link);

  return ok;
}

let alreadyRecorded: any[] = [];

function sleep(m) { return new Promise(r => setTimeout(r, m)) }
export async function emailLoop() {
  console.log('starting email loop')
  while (true) {
    await sleep(1000 * 5)

    console.log('listing')
    let email = await listEmail()!;
    if (!email) continue;
    console.log('email list. length:', email.length)
    email = email.filter(e => !alreadyRecorded.includes(e.id));
    console.log('email list minus already clicked. length:', email.length)
    for (let e of email) {
      console.log('handling email', e.id)
      if (await isIdSuccess(e.id)) {
        alreadyRecorded.push(e.id)
        continue;
      }

      if (!e.id) continue;
      let content = await getEmail(e.id);
      // console.log(content)
      let stringContent = decodeBase64Url(content.data.raw!).toString();

      let ok = (await clickEmail(stringContent)).ok;

      console.log('success:', ok)

      recordId(e.id, ok);

    }
  }
}


emailLoop()