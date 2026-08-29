/**
 * ==============================================================================
 * CivicPulse - Initial Seed Data
 * ==============================================================================
 * Realistic civic issues for instant demoing during hackathon presentations.
 * When the app loads for the first time, this dataset initializes localStorage.
 */

const INITIAL_ISSUES = [
  {
    id: "civic-101",
    title: "Deep Pothole on Market St Bus Lane",
    category: "pothole",
    severity: "high",
    status: "in_progress",
    description: "Large 8-inch deep crater on the right lane near the bus stop. Multiple cyclists and cars have suffered tire punctures. Poses severe safety risk during night hours.",
    lat: 37.7833,
    lng: -122.4167,
    address: "742 Market St (Near 4th St Intersection)",
    neighborhood: "Downtown / Financial District",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      reputation: 140
    },
    upvotes: 42,
    upvotedByMe: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    department: "Department of Transportation (DOT)",
    timeline: [
      { status: "reported", label: "Issue Reported by Citizen", time: "2 days ago", note: "Coordinates logged with photo verification." },
      { status: "verified", label: "Inspected by City Inspector #412", time: "1 day ago", note: "Hazard level confirmed as High." },
      { status: "in_progress", label: "Asphalt Repair Crew Dispatched", time: "4 hours ago", note: "Crew scheduled for cold-mix filling." }
    ],
    comments: [
      {
        id: "c1",
        author: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
        text: "Nearly ruined my wheel rim here yesterday! Glad city crew is finally assigned.",
        createdAt: "1 day ago"
      },
      {
        id: "c2",
        author: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
        text: "Please put a temporary cone around it until asphalt sets.",
        createdAt: "3 hours ago"
      }
    ]
  },
  {
    id: "civic-102",
    title: "Overflowing Garbage Dumpster & Debris",
    category: "garbage",
    severity: "critical",
    status: "reported",
    description: "Illegal commercial dumping blocking the pedestrian sidewalk and attracting pests. Cardboard boxes and plastic debris spilling onto the road.",
    lat: 37.7694,
    lng: -122.4284,
    address: "560 Valencia St, Mission District",
    neighborhood: "Mission District",
    imageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      reputation: 95
    },
    upvotes: 67,
    upvotedByMe: true,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
    department: "Public Works & Sanitation",
    timeline: [
      { status: "reported", label: "Issue Reported by Citizen", time: "12 hours ago", note: "High priority waste alert triggered." }
    ],
    comments: [
      {
        id: "c3",
        author: "David Kim",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        text: "This happens every Friday night. We need a security camera installed here.",
        createdAt: "8 hours ago"
      }
    ]
  },
  {
    id: "civic-103",
    title: "Flickering / Dead Streetlights on Residential Walkway",
    category: "streetlight",
    severity: "medium",
    status: "verified",
    description: "3 consecutive street lamps are completely dark along the park path. Walking home from the transit station is pitch black and dangerous.",
    lat: 37.7648,
    lng: -122.4467,
    address: "Buena Vista Ave West & Haight St",
    neighborhood: "Haight-Ashbury",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Chloe Chen",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      reputation: 210
    },
    upvotes: 31,
    upvotedByMe: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    department: "Bureau of Street Lighting",
    timeline: [
      { status: "reported", label: "Issue Reported", time: "3 days ago", note: "Report logged with pole numbers #BV-12, #BV-13." },
      { status: "verified", label: "City Verification Completed", time: "Yesterday", note: "Ballast failure diagnosed. Work order #SL-8849 issued." }
    ],
    comments: []
  },
  {
    id: "civic-104",
    title: "Burst Water Main Flooding Street Corner",
    category: "water_leak",
    severity: "critical",
    status: "in_progress",
    description: "High-pressure clean water gushing from beneath asphalt sidewalk. Water pooling across 2 traffic lanes causing hydroplaning hazard.",
    lat: 37.7915,
    lng: -122.4089,
    address: "Montgomery St & Pine St",
    neighborhood: "Financial District",
    imageUrl: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Jason Miller",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      reputation: 320
    },
    upvotes: 89,
    upvotedByMe: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    department: "Municipal Water Works",
    timeline: [
      { status: "reported", label: "Critical Leak Alert", time: "5 hours ago", note: "Emergency dispatch notified." },
      { status: "verified", label: "Water Valve Isolated", time: "3 hours ago", note: "Main feeder valve shut down to prevent sinkhole." },
      { status: "in_progress", label: "Excavation and Pipe Fitting", time: "1 hour ago", note: "Replacement 6-inch ductile iron pipe being installed." }
    ],
    comments: [
      {
        id: "c4",
        author: "Lisa Wong",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
        text: "Building water pressure was lost at 9 AM, crew is actively working on it right now!",
        createdAt: "2 hours ago"
      }
    ]
  },
  {
    id: "civic-105",
    title: "Malfunctioning Traffic Signal (Stuck on Red All Directions)",
    category: "traffic_signal",
    severity: "critical",
    status: "resolved",
    description: "Intersection signal loop controller crashed during storm. Creating severe gridlock during morning commute.",
    lat: 37.7782,
    lng: -122.3912,
    address: "King St & 4th St (Caltrain Station)",
    neighborhood: "South Beach / Mission Bay",
    imageUrl: "https://images.unsplash.com/photo-1520690214108-2e76117386ae?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Tara Gupta",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
      reputation: 180
    },
    upvotes: 54,
    upvotedByMe: false,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    department: "Traffic Operations Center",
    timeline: [
      { status: "reported", label: "Reported", time: "4 days ago", note: "Signal sync error reported." },
      { status: "verified", label: "Traffic Officer On Site", time: "4 days ago", note: "Manual traffic directing deployed." },
      { status: "in_progress", label: "Controller Reboot & Recalibration", time: "3 days ago", note: "Replaced faulty relay motherboard." },
      { status: "resolved", label: "Signal Fully Operational", time: "3 days ago", note: "Tested under 100% traffic cycle load." }
    ],
    comments: []
  },
  {
    id: "civic-106",
    title: "Broken Curb & Cracked Sidewalk Tree Root Damage",
    category: "sidewalk",
    severity: "medium",
    status: "reported",
    description: "Tree roots have pushed sidewalk slabs 4 inches up creating an extreme tripping hazard for elderly pedestrians and wheelchair users.",
    lat: 37.7512,
    lng: -122.4182,
    address: "24th St & Folsom St",
    neighborhood: "Mission District",
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Gabriel Santos",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
      reputation: 75
    },
    upvotes: 28,
    upvotedByMe: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    department: "Sidewalk Maintenance Program",
    timeline: [
      { status: "reported", label: "Report Submitted", time: "1 day ago", note: "Queued for arborist and concrete evaluation." }
    ],
    comments: []
  },
  {
    id: "civic-107",
    title: "Fallen Tree Branch Crushing Bike Rack",
    category: "tree_hazard",
    severity: "high",
    status: "resolved",
    description: "Heavy eucalyptus branch snapped during high winds. Smashed municipal bike racks and partially obstructed roadway.",
    lat: 37.7698,
    lng: -122.4469,
    address: "Golden Gate Park East Entrance (Fell St)",
    neighborhood: "Panhandle / Golden Gate Park",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Emily Watson",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      reputation: 410
    },
    upvotes: 73,
    upvotedByMe: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    department: "Parks & Recreation Forestry",
    timeline: [
      { status: "reported", label: "Hazard Logged", time: "5 days ago", note: "Emergency forestry crew alerted." },
      { status: "in_progress", label: "Chainsaw Crew on Site", time: "5 days ago", note: "Branch sectioned and loaded for mulch recycling." },
      { status: "resolved", label: "Path Cleared & Inspected", time: "4 days ago", note: "Bike racks repaired and debris removed." }
    ],
    comments: [
      {
        id: "c5",
        author: "Kenji Sato",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
        text: "Kudos to the city crew for clearing this in less than 3 hours!",
        createdAt: "4 days ago"
      }
    ]
  },
  {
    id: "civic-108",
    title: "Twin Potholes on Steep Incline",
    category: "pothole",
    severity: "high",
    status: "reported",
    description: "Two consecutive jagged potholes on the uphill grade. Vehicles scraping undercarriages and swerving into oncoming traffic to avoid them.",
    lat: 37.7952,
    lng: -122.4101,
    address: "California St & Mason St (Nob Hill)",
    neighborhood: "Nob Hill",
    imageUrl: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80",
    reporter: {
      name: "Brian O'Connor",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
      reputation: 60
    },
    upvotes: 39,
    upvotedByMe: false,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    department: "Department of Transportation (DOT)",
    timeline: [
      { status: "reported", label: "Issue Submitted", time: "18 hours ago", note: "GPS pin verified." }
    ],
    comments: []
  }
];

// Sample photo presets for quick testing in hackathons
const SAMPLE_PHOTOS = [
  {
    label: "Road Pothole",
    category: "pothole",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Garbage Pile",
    category: "garbage",
    url: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Broken Lamp",
    category: "streetlight",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Water Leak",
    category: "water_leak",
    url: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Broken Sidewalk",
    category: "sidewalk",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
  }
];

if (typeof window !== "undefined") {
  window.INITIAL_ISSUES = INITIAL_ISSUES;
  window.SAMPLE_PHOTOS = SAMPLE_PHOTOS;
}
