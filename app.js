import * as cheerio from "cheerio";
import * as cliProgress from "cli-progress";
import * as https from "https";
import * as fs from "fs";

let results = [];

function writeToFile(data) {
  fs.writeFile("results.txt", data, (err) => {
    if (err) {
      throw err;
      console.log("Data has been written to file successfully.");
    }
  });
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 1,
});

const options = {
  agent: httpsAgent,
};

async function fetchSitemap() {
  try {
    const response = await fetch(
      "https://alphagov.github.io/siteimprove-crawl/non-publisher-mainstream.htm",
      options
    );
    const html = await response.text();

    const $ = cheerio.load(html);

    const links = $("a").toArray();

    const linkArray = links.map((value) => {
      return value.attribs["href"];
    });

    return linkArray;
  } catch (error) {
    console.log(error);
  }
}

async function search(searchTerm) {
  // create new container
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format:
        "Searching... [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
    },
    cliProgress.Presets.shades_grey
  );
  let links = await fetchSitemap();
  // create a new progress bar instance and use shades_classic theme
  // add bars
  const searchProgress = multibar.create(links.length, 0);
  const searchResults = multibar.create(links.length, 0);

  for (const link of links) {
    try {
      const response = await fetch(link, options);
      const html = await response.text();

      const $ = cheerio.load(html);
      const search = $(`body:contains("${searchTerm}")`).text();
      if (search) {
        writeToFile(link);
        searchResults.increment();
      }
    } catch (error) {
      console.log(error);
    }
    // update the current value in your application..
    searchProgress.increment();
  }
  // stop the progress bar
  searchProgress.stop();
  searchProgress.stop();
}

fetchSitemap();
search("bursary");
