import fs from "fs";

// 파일 읽기
const curriculum = JSON.parse(fs.readFileSync("./curriculum.json", "utf8"));
// 모든 비디오 ID를 저장할 Set
const uniqueVideos = new Set();
// 중복된 비디오 ID를 저장할 객체 (ID: [섹션 번호들])
const duplicateVideos = {};

curriculum.sections.forEach((section, sectionIndex) => {
  section.videos.forEach((videoId) => {
    if (uniqueVideos.has(videoId)) {
      // 중복된 비디오 발견
      if (!duplicateVideos[videoId]) {
        duplicateVideos[videoId] = [];
      }
      duplicateVideos[videoId].push(section.id);
    } else {
      uniqueVideos.add(videoId);
    }
  });
});

// 결과 출력
console.log(
  "총 비디오 수:",
  curriculum.sections.reduce((acc, section) => acc + section.videos.length, 0)
);
console.log("유니크한 비디오 수:", uniqueVideos.size);
console.log("\n중복된 비디오:");
Object.entries(duplicateVideos).forEach(([videoId, sections]) => {
  console.log(`VideoID: ${videoId}`);
  console.log(`섹션에서 발견: ${sections.join(", ")}\n`);
});

// 중복 제거된 새로운 curriculum 객체 생성
const cleanedCurriculum = {
  ...curriculum,
  sections: curriculum.sections.map((section, sectionIndex) => ({
    ...section,
    videos: section.videos.filter((videoId) => {
      // 각 섹션 내의 중복 제거
      const uniqueInSection = [...new Set(section.videos)].includes(videoId);

      // 이 비디오가 중복된 비디오인 경우
      if (duplicateVideos[videoId]) {
        // 현재 섹션이 이 비디오가 처음 등장하는 섹션인지 확인
        const firstOccurrence = Math.min(
          ...curriculum.sections.map((s, idx) =>
            s.videos.includes(videoId) ? idx : Infinity
          )
        );

        // 현재 섹션이 첫 등장 섹션인 경우만 true 반환
        return sectionIndex === firstOccurrence && uniqueInSection;
      }

      return uniqueInSection;
    }),
  })),
};

// 새로운 파일로 저장
fs.writeFileSync(
  "./curriculum-cleaned.json",
  JSON.stringify(cleanedCurriculum, null, 2)
);
