const axios = require('axios');
const cheerio = require('cheerio');
const j2cp = require('json2csv').Parser;
const fs = require('fs');

const mystery = 'https://books.toscrape.com/catalogue/category/books/sequential-art_5/index.html';
const baseUrl = 'https://books.toscrape.com/catalogue/category/books/sequential-art_5/';

const book_data = [];

async function getBooks(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const books = $('article');
        books.each(function() {
            title = $(this).find('h3 a').text();
            price = $(this).find('.price_color').text();
            stock = $(this).find('.availability').text().trim();
            link = $(this).find('h3 a').attr('href');

            book_data.push({title, price, stock, link});
        });

        // código para passar de página
        if ($('.next a').length > 0) {
            next_page = baseUrl + $('.next a').attr('href');
            getBooks(next_page);
        } else {
            // salvar resultado em um arquivo .csv
            const parser = new j2cp();
            const csv = parser.parse(book_data);
            fs.writeFileSync('./books_sequencial.csv', csv);
        }

        console.log(book_data);
        
    } catch (error) {
        console.error(error);
    }
}

getBooks(mystery);
