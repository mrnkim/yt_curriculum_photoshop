import fs from "fs";

// Helper function to extract IDs from allVideos.json
function extractAllVideosIds(allVideosJson) {
  return allVideosJson.map((video) => video._id);
}

// Helper function to extract IDs from summaries.json
function extractSummariesIds(summariesJson) {
  return Object.keys(summariesJson);
}

// Helper function to extract IDs from curriculum.json
function extractCurriculumIds(curriculumJson) {
  const ids = new Set();
  curriculumJson.sections.forEach((section) => {
    section.videos.forEach((videoId) => {
      ids.add(videoId);
    });
  });
  return Array.from(ids);
}

function validateVideoIds(allVideos, summaries, curriculum) {
  // Extract IDs from each file
  const allVideosIds = new Set(extractAllVideosIds(allVideos));
  const summariesIds = new Set(extractSummariesIds(summaries));
  const curriculumIds = new Set(extractCurriculumIds(curriculum));

  // Get total counts including duplicates in curriculum
  const totalCurriculumIds = curriculum.sections.reduce(
    (count, section) => count + section.videos.length,
    0
  );

  // Check total count
  console.log("\nVideo counts:");
  console.log("allVideos.json:", allVideosIds.size);
  console.log("summaries.json:", summariesIds.size);
  console.log("curriculum.json (unique):", curriculumIds.size);
  console.log("curriculum.json (total with duplicates):", totalCurriculumIds);
  console.log("Expected count:", 220);

  // Check if all sets have the same IDs
  const allVideosArray = Array.from(allVideosIds);
  const summariesArray = Array.from(summariesIds);
  const curriculumArray = Array.from(curriculumIds);

  // Find missing IDs
  const missingInSummaries = allVideosArray.filter(
    (id) => !summariesIds.has(id)
  );
  const missingInCurriculum = allVideosArray.filter(
    (id) => !curriculumIds.has(id)
  );
  const extraInSummaries = summariesArray.filter((id) => !allVideosIds.has(id));
  const extraInCurriculum = curriculumArray.filter(
    (id) => !allVideosIds.has(id)
  );

  // Print results
  console.log("\nValidation Results:");

  if (missingInSummaries.length > 0) {
    console.log(
      "IDs in allVideos but missing in summaries:",
      missingInSummaries
    );
  }

  if (missingInCurriculum.length > 0) {
    console.log(
      "IDs in allVideos but missing in curriculum:",
      missingInCurriculum
    );
  }

  if (extraInSummaries.length > 0) {
    console.log("Extra IDs in summaries:", extraInSummaries);
  }

  if (extraInCurriculum.length > 0) {
    console.log("Extra IDs in curriculum:", extraInCurriculum);
  }

  if (
    missingInSummaries.length === 0 &&
    missingInCurriculum.length === 0 &&
    extraInSummaries.length === 0 &&
    extraInCurriculum.length === 0 &&
    allVideosIds.size === 220
  ) {
    console.log(
      "All validations passed! Files contain matching 220 video IDs."
    );
  }
}

// Read the JSON files
try {
  const allVideosJson = JSON.parse(fs.readFileSync("./allVideos.json", "utf8"));
  const summariesJson = JSON.parse(fs.readFileSync("./summaries.json", "utf8"));
  const curriculumJson = JSON.parse(
    fs.readFileSync("./curriculum.json", "utf8")
  );

  // Run the validation
  validateVideoIds(allVideosJson, summariesJson, curriculumJson);
} catch (error) {
  console.error("Error reading or parsing JSON files:", error);
}
