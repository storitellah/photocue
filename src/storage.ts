import {openDB} from 'idb'; import type {Prompt,Story} from './types';
const db=openDB('photocue',1,{upgrade(db){db.createObjectStore('stories',{keyPath:'id'});db.createObjectStore('history',{keyPath:'id'});}});
export async function stories(){return (await db).getAll('stories') as Promise<Story[]>} export async function putStory(s:Story){return (await db).put('stories',s)}
export async function history(){return (await db).getAll('history') as Promise<Prompt[]>} export async function putPrompt(p:Prompt){return (await db).put('history',p)}
export async function clearAll(){(await db).close();await indexedDB.deleteDatabase('photocue');localStorage.clear();location.reload()}
export function seed(){let s=localStorage.getItem('pc-seed');if(!s){const b=new Uint32Array(4);crypto.getRandomValues(b);s=[...b].join('-');localStorage.setItem('pc-seed',s)}return s}
