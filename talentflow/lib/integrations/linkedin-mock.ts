import fs from "fs";
import path from "path";

/**
 * Loads mock LinkedIn profiles from JSON file.
 */
export async function loadLinkedInMock() {
  const filePath = path.join(process.cwd(), "data", "linkedin-mock.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const profiles = JSON.parse(rawData);

  // Map each profile to the format expected by the system
  return profiles.map((p: any) => ({
    name: p.name,
    email: p.email,
    phone: p.phone,
    skills: p.skills,
    location: p.location,
    headline: p.headline,
    experience_years: p.experience?.reduce((acc: number, exp: any) => acc + (exp.years || 0), 0) || 0,
    education: p.education || [],
    companies: p.experience?.map((exp: any) => exp.company) || [],
    source: "linkedin"
  }));
}
