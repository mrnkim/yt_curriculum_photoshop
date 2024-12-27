import { readFileSync } from "fs";

function countEntries(jsonFilePath) {
  const data = JSON.parse(readFileSync(jsonFilePath, "utf8"));
  const count = Object.keys(data).length;
  console.log(`Total number of entries: ${count}`);
}

// 파일 경로를 지정하여 실행
countEntries("src/data/summaries.json");
