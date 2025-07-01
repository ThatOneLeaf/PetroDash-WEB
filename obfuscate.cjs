const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const buildDir = path.join(__dirname, 'dist/assets');
const files = fs.readdirSync(buildDir);

files.forEach((file) => {
  if (file.endsWith('.js')) {
    const filePath = path.join(buildDir, file);
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
    }).getObfuscatedCode();
    fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
  }
});
