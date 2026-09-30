const fs = require('fs');
const path = require('path');

const directory = 'c:/SIH MODEL/urban-sense-live-main/src';

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const original = content;
            content = content.replace(/Lok-Sahyog/g, 'Urban Eye');
            content = content.replace(/LoksAI/g, 'Urban Eye');
            content = content.replace(/Lokshayog/g, 'Urban Eye');
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir(directory);
console.log('Brand replace done.');
