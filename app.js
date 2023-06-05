import * as cheerio from "cheerio";

function getRandomLink(array) {
  const randomLinkIndex = Math.floor(Math.random() * array.length);
  return array[randomLinkIndex].toString();
}

async function findLinks(url) {
  try {
    // Fetch data from URL and store the response into a const
    const response = await fetch(url);
    // Convert the response into text
    const html = await response.text();

    const $ = cheerio.load(html);

    const links = $("a").toArray();

    const linkArray = links
      .map((value) => {
        return value.attribs["href"];
      })
      .filter((value) => value !== undefined)
      .map((value) => {
        return new URL(value, url);
      })
      .filter((link) => {
        if (process.env.SKIP_CURRENT_PAGE) {
          return link.toString() !== url.toString();
        }
        return true;
      })
      .filter((link) => link.protocol === "http:" || link.protocol === "https:")
      .filter((link) => {
        return !(
          link.pathname.endsWith(".atom") ||
          link.pathname.endsWith(".pdf") ||
          link.pathname.includes("admin") ||
          link.pathname.includes("/t/")
        );
      })
      .filter((link) => link.hostname !== new URL(url).hostname)
      .filter((link) => !link.hostname.includes("reddit"));

    return linkArray;
  } catch (error) {
    console.log(error);
    return [];
  }
}

const url = "https://www.reddit.com";
const baseHostname = new URL(url).hostname;

async function navigate(nextUrl) {
  try {
    const links = await findLinks(nextUrl);
    if (links.length === 0) {
      console.log("We've hit a dead end");
      process.exit();
    }
    const next = getRandomLink(links);
    if (!nextUrl.includes(url)) {
      console.log("I've escaped!");
    }
    console.log(`${nextUrl}`);
    navigate(next);
  } catch (error) {
    console.log(`${nextUrl}`);
    console.log(error);
  }
}

navigate(url);
