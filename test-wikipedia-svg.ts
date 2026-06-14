async function testSvg() {
  const url = "https://upload.wikimedia.org/wikipedia/commons/e/ec/Logo_de_l%27Institut_de_recherche_pour_le_d%C3%A9veloppement_%282016%29.svg";
  console.log("Fetching:", url);
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      console.log("SUCCESS! Length:", text.length);
      console.log("First 800 chars:");
      console.log(text.substring(0, 800));
    } else {
      console.log("Failed with status:", res.status);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

testSvg();
