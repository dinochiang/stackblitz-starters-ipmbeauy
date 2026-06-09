import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { client } from "../lib/openai.js";
import {
  qdrant,
  coffee_COLLECTION,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "../lib/qdrant.js";

const CSV_PATH = "data/coffee.csv";
const BATCH_SIZE = 100;

//Coffee_Name,Ingredients_and_Ratio,Flavor_Profile,Target_Audience
function rowToText(row) {
  return [
    row.Coffee_Name,
    row.Ingredients_and_Ratio,
    row.Flavor_Profile,
    row.Target_Audience,
  ]
    .filter(Boolean)
    .join(" | ");
}

async function recreateCollection() {
  const exists = await qdrant.collectionExists(coffee_COLLECTION);
  if (exists.exists) {
    await qdrant.deleteCollection(coffee_COLLECTION);
  }
  await qdrant.createCollection(coffee_COLLECTION, {
    vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
  });
}

async function embedBatch(texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function main() {
  const csv = await readFile(CSV_PATH, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true });
  console.log(`讀到 ${rows.length} 筆資料`);

  await recreateCollection();
  console.log(`已建立 collection: ${coffee_COLLECTION}`);

  let processed = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const texts = batch.map(rowToText);
    const vectors = await embedBatch(texts);
//Coffee_Name,Ingredients_and_Ratio,Flavor_Profile,Target_Audience
    const points = batch.map((row, idx) => ({
      id: i + idx,
      vector: vectors[idx],
      payload: {
        show_id: row.show_id,
        Coffee_Name: row.Coffee_Name,
        Ingredients_and_Ratio: row.Ingredients_and_Ratio,
        Flavor_Profile: row.Flavor_Profile,
        Target_Audience: row.Target_Audience,
      },
    }));

    await qdrant.upsert(coffee_COLLECTION, { wait: true, points });
    processed += batch.length;
    console.log(`進度：${processed} / ${rows.length}`);
  }

  console.log("完成！");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});