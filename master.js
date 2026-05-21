const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const { analyzeResources } = require('./resourceAnalyzer');
const { log, saveLogs } = require('./logger');

async function runWorker(config) {
  return new Promise((resolve) => {
    const worker = new Worker('./worker.js', { workerData: { config } });
    
    worker.on('message', (result) => {
      if (result.success) {
        log('INFO', `Built: ${result.appId}`, { duration: result.duration + 'ms', path: result.path });
      } else {
        log('ERROR', `Failed: ${result.appId}`, { error: result.error });
      }
      resolve(result);
    });

    worker.on('error', (err) => {
      log('ERROR', `Worker crashed for ${config.appId}`, { error: err.message });
      resolve({ success: false, appId: config.appId });
    });
  });
}

async function main() {
  console.log('\n🕌 ADAGDS — Quran App Generator\n');
  
  const resources = analyzeResources();
  log('INFO', 'System Resources', resources);
  console.log(`\n🖥️  CPUs: ${resources.cpuCount} | Free RAM: ${resources.freeMemGB}GB`);
  console.log(`📱 Safe to generate: ${resources.recommendedApps} apps\n`);

  const configDir = path.join(__dirname, 'configs');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  const allConfigs = fs.readdirSync(configDir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(configDir, f))))
    .slice(0, resources.recommendedApps);

  log('INFO', `Generating ${allConfigs.length} apps in parallel`);

  fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });

  const startTime = Date.now();
  const results = await Promise.all(allConfigs.map(config => runWorker(config)));
  const totalTime = Date.now() - startTime;

  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Generated: ${success} apps`);
  console.log(`❌ Failed:    ${failed} apps`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📂 Check the /output folder!');

  saveLogs();
}

main();