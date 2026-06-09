// main.js 把單次對話包成持續迴圈 & 記憶問答內容
import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import "dotenv/config";
import {initMessage, addMessage, getMessages} from './db/message.js'

// import { OPENAI_API_KEY } from "./config.js";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage("你是⼀位極具專業的美食評論家，你每天都在網路和市街探訪美味且具有特色的庶民小吃，而且你介紹的風格非常有趣，說的好像味道會從手機或電腦螢幕飄來來似的，此外，還要能夠提供推薦的商家資訊與推薦指數。");
while (true) {
const userQuestion = (
await input({ message: "請輸入你的問題：" })
 ).trim();
await addMessage(userQuestion);
const response = await client.chat.completions.create({
model: "gpt-5-mini",
messages: getMessages(), // ← 帶完整歷史
 });
const content = response.choices[0].message.content;
console.log(content);
await addMessage(content, "assistant");
}

