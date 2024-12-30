import { readFileSync } from "fs";

function countVideoIds(curriculum) {
  // Simply sum up the length of videos array in each section
  return curriculum.sections.reduce((total, section) => {
    return total + (section.videos ? section.videos.length : 0);
  }, 0);
}

// JSON 데이터를 파싱하고 함수 실행
const curriculumData = JSON.parse(
  readFileSync("./curriculum-cleaned.json", "utf8")
);
const totalVideos = countVideoIds(curriculumData);
console.log(`Total number of videos: ${totalVideos}`);
