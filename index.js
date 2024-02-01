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

async function selectOptionByText(page, selector, searchText) {
    await page.click(selector);

    await page.waitForSelector('.ng-option-label');

    const options = await page.$$('.ng-option-label');

    const matchingOption = options.find(async (option) => {
        const text = await option.evaluate(node => node.innerText.trim().toLowerCase());
        return text.includes(searchText.toLowerCase());
    });

    if (matchingOption) {
        await matchingOption.click();
    } else {
        console.error(`Option with text "${searchText}" not found`);
    }
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

const start = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args:["--start-maximized"],
    })

    const page = await browser.newPage()

    await page.setViewport({width:1280, height: 800});

    await page.goto(sisu_url, {waitUntil: "networkidle2"});

    await page.waitForSelector('.ng-autocomplete');

    await page.click('.ng-autocomplete');

    await page.waitForSelector('.ng-input input');

    await page.type('.ng-input input', data.university, { delay: 50 });
    
    await selectOptionByText(page, '.ng-autocomplete', data.university);


    await sleep(1500);

    const ngSelectValue = await page.$eval('.ng-autocomplete', (element) => {
        return element.innerText;
    });

    console.log('ng-select value:', ngSelectValue);
}

start();