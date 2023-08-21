import * as cheerio from "cheerio";

async function fetchSitemap() {
  try {
    const response = await fetch(
      "https://alphagov.github.io/siteimprove-crawl/non-publisher-mainstream.htm"
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

// async function search(searchTerm) {
//   let links = await fetchSitemap();
//   for (const link of links) {
//     try {
//       const response = await fetch(link);
//       const html = await response.text();

//       const $ = cheerio.load(html);
//       const search = $(`body:contains("${searchTerm}")`).text();
//       if (search) {
//         console.log(`Found "${searchTerm}" on ${link}`);
//       } else {
//         console.log(".");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

let listOfUrls = await fetchSitemap();

await (async (listOfUrls, MAX_PARALLEL_REQUESTS) => {
  let requestQ = [];

  for (let i = 0; i < listOfUrls.length; i++) {
    if (requestQ.length >= MAX_PARALLEL_REQUESTS) {
      let nextRequest = requestQ.shift();

      await nextRequest.then((response) => {
        console.log(response.text());
      });
    }

    requestQ.push(fetch(listOfUrls[i]));
  }

  while ((nextRequest = requestQ.shift())) {
    await nextRequest.then((response) => {
      console.log(response.text());
    });
  }
})(listOfUrls, 5);

fetchSitemap();
// search("public health");
