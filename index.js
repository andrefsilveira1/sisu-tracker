const puppeteer = require("puppeteer");
const sisu_url = "https://sisu.mec.gov.br/#/selecionados";

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
    name: 'GUSTAVO DAVI COSTA ALVES',
    university: process.argv[3],
    campus: process.argv[4],
    degree: process.argv[6],
    Shift: process.argv[6],
    curso: 'Engenharia da computação'
}


console.log("Data loaded: ", data);


async function typeAndSelectOption(page, selector, value, autocompleteSelector, flag = true) {

    await page.type(selector, value, { delay: 50 });

    flag ? await selectOptionByText(page, autocompleteSelector, value) : '';
    flag ? await page.keyboard.press('Tab') : '';

    await sleep(500);
}

async function Search(page) {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(sisu_url, { waitUntil: "networkidle2" });

    await typeAndSelectOption(page, '.ng-input input', data.university, '.ng-autocomplete');
    await typeAndSelectOption(page, '.ng-input:nth-child(2) input', data.campus, '.ng-autocomplete', false);

    await page.keyboard.press('Enter');

    await typeAndSelectOption(page, '.ng-autocomplete-curso .ng-input input', data.curso, '.ng-autocomplete-curso');

    await page.keyboard.press('Tab');
    await sleep(500);

    await typeAndSelectOption(page, '.ng-autocomplete-curso .ng-input:nth-child(2) input', data.degree, '.ng-autocomplete-curso', false);

    await page.keyboard.press('Enter');

    await page.waitForSelector('.btn-botao');
    await sleep(200);
    await page.click('.btn-botao');

}


async function findName(page, nameElements) {
    for (const nameElement of nameElements) {
        const name = await page.evaluate(element => element.textContent.trim(), nameElement);
        const cleanedString = name.replace("Nome do candidato: ", "");

        if (cleanedString.trim().toUpperCase() === data.name.trim().toUpperCase()) {
            console.log("Names matched!")
            return true
        }
    }
}


const start = async () => {
    const browser = await puppeteer.launch({
        args: ["--start-maximized"],
    })

    const page = await browser.newPage()
    await page.goto(sisu_url, { waitUntil: "networkidle2" });
    await Search(page)
    await sleep(100);

    const nameSelector = '.item-selecionados .col-md-7.col-sm-10';
    const nameElements = await page.$$(nameSelector);
    const result = await findName(page, nameElements);

    if(!result) {
        console.log("Names did not matched");
    }

    process.exit()
}


start();