# PROMPT 4

Analyze this LASUSTECH campus map image.
Extract every visible location into JSON.
Include name, category, nearby landmarks,
approximate position, and nearest gate if obvious.
Return valid JSON only.
See sample below for guideance
{
  "locations": [
    {
      "name": "Library",
      "category": "facility",
      "nearby": ["200 Seater", "College of Engineering"],
      "nearestGate": "3rd School Gate",
      "position": "upper-right section of campus"
    },
    {
      "name": "ICT Centre",
      "category": "technology facility",
      "nearby": ["ICT Lab", "Main Road"],
      "nearestGate": "3rd School Gate",
      "position": "lower-right section of campus"
    }
  ]
}
Attached is the generated info extracted from the image - use it as the true data source to update campusData information where applicable