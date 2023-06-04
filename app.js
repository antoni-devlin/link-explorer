import * as cheerio from "cheerio";

async function findLinks(url) {
  try {
    // Fetch data from URL and store the response into a const
    const response = await fetch(url);
    // Convert the response into text
    const html = await response.text();

    const $ = cheerio.load(html);

    const links = $("a");

    const linkArray = [];

    links.each((index, value) => {
      // Print the text from the tags and the associated href
      const href = $(value).attr("href");
      if (href) {
        linkArray.push(String(href));
      }
    });
    return linkArray;
  } catch (error) {
    console.log(error);
  }
}

const url = "https://reddit.com";