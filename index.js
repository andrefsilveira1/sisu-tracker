const puppeteer = require("puppeteer");

function colorize(text, colorCode) {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


if (process.argv.length < 7) {
    console.error(colorize('ERROR: Please, provide Name, University, Campus,  Degree and Shift', 31));
    process.exit(1);
}


const data = {
    name: process.argv[2],
    university: process.argv[3],
    campus: process.argv[4],
    degree: process.argv[5],
    Shift: process.argv[6],
}


console.log("Are those data correct?", data);



const sisu_url = "https://sisu.mec.gov.br/#/selecionados"