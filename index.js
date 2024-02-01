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
    name: 'Gustavo Davi Costa Alves',
    university: process.argv[3],
    campus: process.argv[4],
    degree: process.argv[6],
    Shift: process.argv[6],
    curso: 'Engenharia da computação'
}


console.log("Are those data correct?", data);



const sisu_url = "https://sisu.mec.gov.br/#/selecionados"

const start = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"],
    })

    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(sisu_url, { waitUntil: "networkidle2" });

    await page.waitForSelector('.ng-autocomplete');

    await page.type('.ng-input input', data.university, { delay: 50 });

    await selectOptionByText(page, '.ng-autocomplete', data.university);

    await page.keyboard.press('Tab');

    await sleep(500)

    await page.type('.ng-input input', data.campus, { delay: 50 });

    await selectOptionByText(page, '.ng-autocomplete-campus', data.campus);

    //
    await page.keyboard.press('Tab');

    await sleep(500)

    await page.type('.ng-autocomplete-curso .ng-input input', data.curso, { delay: 35 });

    await selectOptionByText(page, '.ng-autocomplete-curso', data.curso);

    await page.keyboard.press('Tab');

    await sleep(600)

    await page.type('.ng-autocomplete-curso .ng-input:nth-child(2) input', data.degree, { delay: 50 });

    await page.keyboard.press('Enter');

    await page.waitForSelector('.btn-botao');

    await sleep(1500);

    await page.click('.btn-botao');


    // End of search

    await sleep(5000);

    const nameSelector = '.item-selecionados .col-md-7.col-sm-10';
    const nameElements = await page.$$(nameSelector);

    for (const nameElement of nameElements) {
        const name = await page.evaluate(element => element.textContent.trim(), nameElement);
        if (name.trim().toUpperCase === data.name.trim().toUpperCase) {
            console.log("Names matched!")
            return true
        }
    }
}

start();