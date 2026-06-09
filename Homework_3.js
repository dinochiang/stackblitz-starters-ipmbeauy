import { input } from "@inquirer/prompts";
import { searchNetflix } from "./lib/qdrant.js";
import { spinner } from "./utils/spinner.js";

try {
  while (true) {
    const query = (
      await input({ message: "這週想到哪走走，讓寶島旅遊達人幫您介紹：" })
    ).trim();

    if (query === "") continue;
    if (query.toLowerCase() === "exit") {
      console.log("祝您旅途愉快!");
      break;
    }

    const spin = spinner("搜尋中...").start();
    const results = await searchNetflix(query, 5);
    spin.stop();
//Coffee_Name,Ingredients_and_Ratio,Flavor_Profile,Target_Audience
    for (const [i, r] of results.entries()) {
        console.log(`地區：${r.Area}`);
        console.log(`城市：${r.City}`);
        console.log(`美食：${r.Food}`);
        console.log(`地方特色：${r.Feature}`);
    }
    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再見~");
  } else {
    throw err;
  }
}