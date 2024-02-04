const { exec } = require('node:child_process');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const logFilePath = path.join(__dirname, 'activityMonitor.log');
const refreshRate = 100;
const logRate = 60000;
let buffer = '';

function getTopProcess() {
    const platform = os.platform();
    const command = platform === 'win32'
        ? 'powershell "Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + \' \' + $_.CPU + \' \' + $_.WorkingSet }"'
        : 'ps -A -o %cpu,%mem,comm | sort -nr | head -n 1';
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Command stderr: ${stderr}`);
            return;
        }
        buffer = stdout;
        console.clear();
        console.log(stdout);
    });
}

function logData() {
    fs.appendFile(logFilePath, `{ ${Date.now()}: ${buffer} }\n`, (err) => {
        if (err) throw err;
        })
}

setInterval(getTopProcess, refreshRate);
setInterval(logData, logRate)
