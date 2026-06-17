/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CampusLocation, CampusCategory, RecentSearch } from './types.ts';

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'library',
    name: 'Library',
    subtitle: 'Academic Facility',
    category: 'academic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh8jC9GvbGTSlF-Z8TOqSjgd3Qgt45eVzOHDHHjm9JcLio0Rny1t7akXylDNukTzkt07ASfr5qzpyGgfDWb6tIcMOgJRG1HhIblZlh2mOijDSOQr310sEZXvHGcRl1-H6VQokeAsGMkZS11lG7LIPBDPTm9d4EhaXVOqpfZSnjG-X-3gTrVcFbCewet_UPRO7XzHSJd4mySa7dYJ0kzFp_shitzBNRTP7axqg8Wisv9yTb2CnsDhYKivxMN9UrtlmPV3YQtlktwxI',
    distance: '350m',
    walkTime: '5 mins',
    icon: 'book',
    description: 'The Central Academic Library is equipped with expansive reading corridors, electronic research archives, and cooling study rooms. Directly situated near the 200 Seater Theatre Hall and College of Engineering.',
    coordinates: { x: 76, y: 30 },
    steps: [
      'Take Main Road leading towards the east sector of the campus.',
      'Pass past the College of Basic Science and the 200 Seater Theatre hall.',
      'The Library block with large study windows is directly on your right, across from the mini green bush areas.'
    ]
  },
  {
    id: 'ict-centre',
    name: 'ICT Centre',
    subtitle: 'Technology Facility',
    category: 'services',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZLDPzPFRum8G_322n65rCGyNK_9BupSMvmKyIS0QaHmx3AHiobwg61mDbi9sTwB3co0MauIBKcRqjMaNwIq19dzRDXXTqQg-_0AZqj17MLvFJQZomoYefCVJCJnnVVgqlIAuiYbxbkelwjMeRYR1T6UJLmxeJrX4hQzg80iE_SihHAu5yT6VfZqo6nS82NWiL6otGfUl_ATaIt0tAVINB7o6N-NMDWYX0U-EdNqXd39u7s04OIvD4XhYZiGHF8EktP4zMWX8C1Q',
    distance: '650m',
    walkTime: '8 mins',
    icon: 'laptop',
    description: 'Major technology campus node housing computers for computer-based tests, examinations, university portal help desk, e-payment administration, and ICT installations. Connected directly link to the ICT Lab.',
    coordinates: { x: 65, y: 65 },
    steps: [
      'From 1st School Gate, follow the lower Main Road eastwards.',
      'Walk past the Director of Sport center and the Administration Block.',
      'Turn left at the technology crossroad; the ICT Centre block is located directly ahead, adjacent to the ICT Lab.'
    ]
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    subtitle: 'Department Block',
    category: 'academic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZJPEB26bepHok_Hc1g3fKVSJl2BoJsAWmGg79Rlc1reKYC8048Cw_wrb4R36Vgpp2zrsvqAANU3DYG1oLI_SEP0LFbobKsgTj-4bQlLi1heIjZeJUm17891_jOC1SGmH7_dlQ6q-vYqgVOXUAtndZ0GpEKWjWjCb60Jq6I00v28fASVqWcCXw1dPez8L1wn3OiFTMoPBni0Ote-LiJ4L-gHUX7K9B3V8wcRBT_NS6c8Vs5Uka-_FD7aexk1oXU76xJSg54Jo9lZI',
    distance: '210m',
    walkTime: '3 mins',
    icon: 'school',
    description: 'The Department of Computer Science hosts coding clusters, network installation hardware labs, artificial intelligence workspaces, and cyber security software development hubs.',
    coordinates: { x: 38, y: 12 },
    steps: [
      'Enter through the 2nd School Gate on the Upper Main Road.',
      'Head past the Lasustech Staff School and Mass Comm building.',
      'The Computer Science block is located on your left, just before the farm experimental plots.'
    ]
  },
  {
    id: 'college-of-engineering',
    name: 'College of Engineering',
    subtitle: 'Innovation Hub',
    category: 'academic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSA6JJYNNpyCt5NP2nbS73XmCbhy_sI0NrdIXGsIFZHMQowDUgpX0qMqhajdmvODVUZY73XpoEs4nbkrDvei3UcqvfOxGXpTp9fFnFhQaSdoMLtU0OZWhrk0DiXy5inJ27r1aM7UqSBf7ooVghp0q9MCi1rq2cRnP32U4QeK6EcbW1zZ6P-5Puhr_VMIPuUctyDzGUEQIG-YZypNsM9X06o5o067RoojzzviLUFTcJ_pa1QaEeXbbEPlrrXVkgHwka1dv1XmXDWJo',
    distance: '780m',
    walkTime: '10 mins',
    icon: 'school',
    description: 'Primary engineering wing of the university featuring mechanical engineering shops, electronic circuit boards design stations, and civil structure workshops. Sits next to the JUPEB block.',
    coordinates: { x: 81, y: 30 },
    steps: [
      'Walk east towards the 3rd School Gate along the central Main Road.',
      'Continue past the Library and the modern 200 Seater Theatre hall.',
      'The College of Engineering stands directly next to the College of Environmental Studies on the east strip.'
    ]
  },
  {
    id: 'student-building',
    name: 'Student Building (NEW)',
    subtitle: 'Student Union Hub',
    category: 'services',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANYsKa2H-6FNCgLrisUeFv_j6aHAkLlI0umalRDb55cqhE1TawbjZBBvOx8LjxcVde0Fp5U6f1z4gv0XjQ4B0OQu-lhHjB3RbPI8X7zH46QRbDXmy9tS6AuEc1s7Ftwf-LRWbnd01WRAbw_Z6owKJiMjJsMbwOsoqw6suFwPrawZ88OBSxRhFeE6aB2RDXgKBAuE6M8d5S5s_McGyHRp52bFVMVoJquEtvCsB9GZDwBQ3ubRC-Re-qMvvMe_6F2Jmo_b2N2VYOp-Y',
    distance: '480m',
    walkTime: '6 mins',
    icon: 'groups',
    description: 'Vibrant student meeting houses, union desks, executive chambers, and student services offices. Adjacent to playing grounds and farm poultry areas.',
    coordinates: { x: 50, y: 35 },
    steps: [
      'Take the middle pedestrian crossroad from the 2nd School Gate.',
      'Follow the lane past the central poultry and pigry husbandry fields.',
      'The Student Building stands facing the primary sports and playing ground lawn.'
    ]
  },
  {
    id: 'admin-block-upper',
    name: 'Admin Block (upper)',
    subtitle: 'Staff Offices',
    category: 'admin',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh8jC9GvbGTSlF-Z8TOqSjgd3Qgt45eVzOHDHHjm9JcLio0Rny1t7akXylDNukTzkt07ASfr5qzpyGgfDWb6tIcMOgJRG1HhIblZlh2mOijDSOQr310sEZXvHGcRl1-H6VQokeAsGMkZS11lG7LIPBDPTm9d4EhaXVOqpfZSnjG-X-3gTrVcFbCewet_UPRO7XzHSJd4mySa7dYJ0kzFp_shitzBNRTP7axqg8Wisv9yTb2CnsDhYKivxMN9UrtlmPV3YQtlktwxI',
    distance: '180m',
    walkTime: '2 mins',
    icon: 'account_balance',
    description: 'Main administrative offices near the GT Bank branch. Handles local staff resources, department rosters, financial claims, and school operations records.',
    coordinates: { x: 24, y: 35 },
    steps: [
      'From 2nd School Gate, go straight on the upper Main Road.',
      'Turn right past the GT Bank branch compound.',
      'The Admin Block is directly ahead, facing the large playing fields.'
    ]
  },
  {
    id: 'gtbank',
    name: 'GT BANK Bank',
    subtitle: 'Commercial Bank Gallery',
    category: 'services',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSA6JJYNNpyCt5NP2nbS73XmCbhy_sI0NrdIXGsIFZHMQowDUgpX0qMqhajdmvODVUZY73XpoEs4nbkrDvei3UcqvfOxGXpTp9fFnFhQaSdoMLtU0OZWhrk0DiXy5inJ27r1aM7UqSBf7ooVghp0q9MCi1rq2cRnP32U4QeK6EcbW1zZ6P-5Puhr_VMIPuUctyDzGUEQIG-YZypNsM9X06o5o067RoojzzviLUFTcJ_pa1QaEeXbbEPlrrXVkgHwka1dv1XmXDWJo',
    distance: '120m',
    walkTime: '1 min',
    icon: 'money',
    description: 'Guaranty Trust Bank branch serving student cash withdrawals, fees payment terminals, and mobile app support. Open Mondays to Fridays.',
    coordinates: { x: 12, y: 35 },
    steps: [
      'Walk exactly 100 meters east from the 2nd School Gate.',
      'The bright orange GT Bank hall stands clearly visible on your right, bordering the green fields.'
    ]
  },
  {
    id: 'mosque',
    name: 'Mosque',
    subtitle: 'Religious Centre',
    category: 'services',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZLDPzPFRum8G_322n65rCGyNK_9BupSMvmKyIS0QaHmx3AHiobwg61mDbi9sTwB3co0MauIBKcRqjMaNwIq19dzRDXXTqQg-_0AZqj17MLvFJQZomoYefCVJCJnnVVgqlIAuiYbxbkelwjMeRYR1T6UJLmxeJrX4hQzg80iE_SihHAu5yT6VfZqo6nS82NWiL6otGfUl_ATaIt0tAVINB7o6N-NMDWYX0U-EdNqXd39u7s04OIvD4XhYZiGHF8EktP4zMWX8C1Q',
    distance: '900m',
    walkTime: '12 mins',
    icon: 'church',
    description: 'Serene place of worship for Islamic prayers and student fellowship. Located on the far right boundary of the campus near the 3rd School Gate.',
    coordinates: { x: 89, y: 70 },
    steps: [
      'Take the lower Main road straight and follow it all the way to the east edge.',
      'Walk past the ICT Lab and the forest-like bush green spaces.',
      'The Mosque dome and minaret stand on your right side just before reaching the 3rd Gate exit.'
    ]
  },
  {
    id: 'sports-complex',
    name: 'Sport Club house',
    subtitle: 'Sports & Recreational Pitches',
    category: 'sports',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYJ2Y4F9fJT3m9rfgp9GOF8JSDAgjDSR37TD5GRgk99xyM',
    distance: '300m',
    walkTime: '4 mins',
    icon: 'trophy',
    description: 'Dynamic local recreation facility beside the Former Medical Center. Has ping pong boards, indoor game lounges, and general sports executive cubicles.',
    coordinates: { x: 23, y: 82 },
    steps: [
      'Enter via the 1st School Gate and walk on the southern lower Main Road.',
      'Pass past the lower commercial Bank and the Former Medical Center.',
      'The Sport Club House building is directly on your right hand side.'
    ]
  },
  {
    id: 'zoological-garden',
    name: 'Zoological Garden',
    subtitle: 'Outdoor Biosphere',
    category: 'sports',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANYsKa2H-6FNCgLrisUeFv_j6aHAkLlI0umalRDb55cqhE1TawbjZBBvOx8LjxcVde0Fp5U6f1z4gv0XjQ4B0OQu-lhHjB3RbPI8X7zH46QRbDXmy9tS6AuEc1s7Ftwf-LRWbnd01WRAbw_Z6owKJiMjJsMbwOsoqw6suFwPrawZ88OBSxRhFeE6aB2RDXgKBAuE6M8d5S5s_McGyHRp52bFVMVoJquEtvCsB9GZDwBQ3ubRC-Re-qMvvMe_6F2Jmo_b2N2VYOp-Y',
    distance: '550m',
    walkTime: '7 mins',
    icon: 'leaf',
    description: 'Diverse live exhibit garden showcasing local bird species, safety reptiles cages, and botanical studies greenhouse under dense natural tree growth.',
    coordinates: { x: 54, y: 58 },
    steps: [
      'Walk to the center crossing from upper or lower highway path.',
      'Turn down past the Fishery Department offices.',
      'The green signposts for the Zoological Gardens are situated directly next to the native forestry path.'
    ]
  }
];

export const CAMPUS_CATEGORIES: CampusCategory[] = [
  { id: 'all', label: 'All Sectors', icon: 'map_pin' },
  { id: 'academic', label: 'Academic', icon: 'school' },
  { id: 'food', label: 'Recreation', icon: 'restaurant' },
  { id: 'sports', label: 'Sports & Parks', icon: 'sports_soccer' },
  { id: 'services', label: 'Core Services', icon: 'build' },
  { id: 'admin', label: 'Admin Hub', icon: 'business' }
];

export const RECENT_SEARCHES: RecentSearch[] = [
  { id: 'library-search', name: 'Library', distance: '350m away', status: 'Open' },
  { id: 'ict-search', name: 'ICT Centre', distance: '650m away', status: 'Active' },
  { id: 'cs-search', name: 'Computer Science', distance: '210m away', status: 'Active' }
];
