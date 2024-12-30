import { readFileSync } from "fs";

function countVideoIds(curriculum) {
  let count = 0;

  // Flatten nested sections if they exist
  const sections = curriculum.sections.reduce((acc, section) => {
    if (section.sections) {
      return [...acc, ...section.sections];
    }
    return [...acc, section];
  }, []);

  // Count videos in each section
  sections.forEach((section) => {
    if (section.videos) {
      count += section.videos.length;
    }
  });

  return count;
}

// JSON 데이터를 파싱하고 함수 실행
const curriculumData = JSON.parse(readFileSync("./curriculum.json", "utf8"));
const totalVideos = countVideoIds(curriculumData);
console.log(`Total number of videos: ${totalVideos}`);
