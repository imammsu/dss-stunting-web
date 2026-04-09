const fs = require('fs');

const content = fs.readFileSync('src/data/villages.ts', 'utf8');

const newInterface = `export interface Village {
  id: number;
  name: string;
  district: string;
  lat: number;
  lng: number;
  vScore: number;
  ranking: number;
  komitmen?: number;
  remaja?: number;
  stunting?: number;
  prevalensi?: number;
  kemiskinan?: number;
  jarak?: number;
  tenagaKerja?: number;
}`;

let newContent = content.replace(/export interface Village \{[\s\S]*?\n\}/, newInterface);

const regex = /\{ id: \d+, name: ".*?", district: ".*?", lat: -?\d+\.\d+, lng: \d+\.\d+, vScore: \d+\.\d+, ranking: \d+ \}/g;
newContent = newContent.replace(regex, (match) => {
  const idStr = match.match(/id: (\d+)/)[1];
  const id = parseInt(idStr);
  const komitmen = 1 + (id % 5);
  const remaja = 10 + (id % 15);
  const stunting = 5 + (id % 20);
  const prevalensi = 15 + (id % 10);
  const kemiskinan = 10 + (id % 15);
  const jarak = 1 + (id % 10);
  const tenagaKerja = 50 + (id * 10);
  
  return match.slice(0, -1) + `, komitmen: ${komitmen}, remaja: ${remaja}, stunting: ${stunting}, prevalensi: ${prevalensi}, kemiskinan: ${kemiskinan}, jarak: ${jarak}, tenagaKerja: ${tenagaKerja} }`;
});

fs.writeFileSync('src/data/villages.ts', newContent);
console.log('villages.ts updated');
