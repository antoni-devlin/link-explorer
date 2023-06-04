import * as cheerio from "cheerio";

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function getRandomLink(array) {
  const filteredArray = array.filter(checkLinks);

  function checkLinks(link) {
    return !(
      link.includes(".atom") ||
      link.includes(".pdf") ||
      link.includes(":") ||
      link.includes("admin") ||
      link.includes("/t/")
    );
  }
  const randomLinkIndex = Math.floor(Math.random() * filteredArray.length);
  let randomLink = filteredArray[randomLinkIndex];
  if (!randomLink.includes(url) && !randomLink.includes("http")) {
    randomLink = url + randomLink;
  }
  if (isValidHttpUrl(randomLink)) {
    return randomLink;
  } else {
    getRandomLink(array);
  }
}

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

async function navigate(nextUrl) {
  try {
    const next = getRandomLink(await findLinks(nextUrl));
    if (!nextUrl.includes(url)) {
      console.log("I've escaped!");
    }
    console.log(`${nextUrl}`);
    navigate(next);
  } catch (error) {
    console.log(error);
  }
}

navigate(url);
