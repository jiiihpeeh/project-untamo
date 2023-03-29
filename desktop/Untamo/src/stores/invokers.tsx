import { invoke } from '@tauri-apps/api';
import { base64StringToBlob } from 'blob-util';

/* 
type 
    Call = enum 
        NotValid = 0
        QrSvg = 1
        SetAppDir = 2
*/

enum CallObject  {
    NotValid = 0,
    QrSvg = 1,
    SetAppDir = 2,
}


export const getQr = async(content: string)  => {
    let name = JSON.stringify({call: CallObject.QrSvg, content: content})
    return JSON.parse(await invoke("nim_caller", {name})) as string;
}

export const setAppDir = async (directory: string): Promise<boolean> => {
    const name = JSON.stringify({call: CallObject.SetAppDir , directory: directory});
    return JSON.parse(await invoke("nim_caller", {name})) as boolean;
}