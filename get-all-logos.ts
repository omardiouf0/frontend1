async function getWikipediaImages() {
  const url = `https://fr.wikipedia.org/w/api.php?action=query&generator=images&titles=Institut_de_recherche_pour_le_d%C3%A9veloppement&gimlimit=50&prop=imageinfo&iiprop=url|size&format=json`;
  console.log("Querying French Wikipedia Page images:", url);
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data: any = await res.json();
      console.log("Images on French Wiki Page:");
      if (data.query && data.query.pages) {
        for (const k of Object.keys(data.query.pages)) {
          console.log(`Title: ${data.query.pages[k].title}`);
          console.log(JSON.stringify(data.query.pages[k].imageinfo, null, 2));
        }
      } else {
        console.log("No images found.");
      }
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

getWikipediaImages();
