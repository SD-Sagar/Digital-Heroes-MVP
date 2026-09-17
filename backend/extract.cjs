const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:\\Users\\RIZA\\Desktop\\project\\Digital Heroes PRD (Level 1).pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('C:\\Users\\RIZA\\.gemini\\antigravity-ide\\brain\\4570e179-0819-42c4-86e2-eab90ef34412\\scratch\\prd.txt', data.text);
    console.log('Extraction complete');
}).catch(err => {
    console.error(err);
});
