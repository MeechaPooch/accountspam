import { google } from "googleapis";


let gmail = google.gmail("v1");
gmail.context._options.auth = google.auth.fromAPIKey('AIzaSyBE3Sy4QWi2_ZPLv_DmINY82UFRB9AfRlk');



let res = await google.gmail('v1').users.getProfile()

console.log(res)