const fs = require('fs');
const path = require('path');

const logs = [];

function log(level, msg, data = {}) {
  const entry = {
    time: new Date().toISOString(),
    level,
    msg,
    ...data
  };
  logs.push(entry);
  const icon = level === 'INFO' ? '✅' : level === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${level}] ${msg}`, data);
}

function saveLogs() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outputDir, 'build_log.json'), JSON.stringify(logs, null, 2));
  console.log('\n📋 Full log saved to output/build_log.json');
}

module.exports = { log, saveLogs };