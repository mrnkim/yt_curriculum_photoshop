import fs from "fs";

// JSON 파일 경로
const filePath = "./summaries.json";

// JSON 파일 읽기
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // JSON 파싱
  let summaries;
  try {
    summaries = JSON.parse(data);
  } catch (parseErr) {
    console.error("Error parsing JSON:", parseErr);
    return;
  }

  // 각 비디오 객체에서 chapters 속성 제거
  for (const key in summaries) {
    if (summaries[key].hasOwnProperty("chapters")) {
      delete summaries[key].chapters;
    }
  }

  // 결과를 JSON 문자열로 변환
  const resultJson = JSON.stringify(summaries, null, 2);

  // JSON 파일에 쓰기
  const outputFilePath = "./summaries_chaptersExcluded.json";
  fs.writeFile(outputFilePath, resultJson, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing file:", writeErr);
      return;
    }
    console.log("Chapters removed successfully.");
  });
});
