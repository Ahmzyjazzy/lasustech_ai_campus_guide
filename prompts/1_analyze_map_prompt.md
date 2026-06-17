# Google AI Studio

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

