const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

function ensureDataDir(){
  if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
}
ensureDataDir();

function filePath(key){
  return path.join(DATA_DIR, `${key}.json`);
}

function read(key, fallback){
  const fp = filePath(key);
  if(!fs.existsSync(fp)){
    write(key, fallback);
    return fallback;
  }
  try{
    const raw = fs.readFileSync(fp,'utf-8');
    return JSON.parse(raw);
  }catch(e){
    console.error(`DB read error ${key}`, e);
    return fallback;
  }
}

function write(key, data){
  const fp = filePath(key);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

function genId(prefix='id'){
  return `${prefix}_${Math.random().toString(36).slice(2,9)}${Date.now().toString(36).slice(-4)}`;
}

module.exports = { read, write, genId, DATA_DIR };
