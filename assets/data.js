window.PLAN = {
  date: '2026-10-09',
  dateLabel: 'Friday, Oct 9, 2026',
  timezone: 'America/Los_Angeles',
  map: {
    w: 3719,
    h: 6000,
    file: 'assets/resort_map.webp',
    fallback: 'assets/resort_map.jpg',
    // CRS.Simple pixel views: center as [x,y] on image, zoom for phone
    views: {
      dl:  { x: 1900, y: 1400, zoom: -1.75 },
      dca: { x: 1850, y: 4650, zoom: -1.75 },
      next:{ zoom: -1.0 }
    }
  },
  group: '6 adults, 3 teens, 1 infant · 9 paid tickets',
  notes: [
    'Indiana Jones is closed (TBD reopen). Skip it.',
    'Verify show times in the Disneyland app the morning of.',
    'Park Hopper. Hopping allowed from 11 AM.'
  ],
  hours: [
    { park: 'Disneyland Park', hours: '8:00 AM to 12:00 AM', tip: 'Closes at midnight. Rope drop at Main Street. Late re-rides after the fireworks.' },
    { park: 'Disney California Adventure', hours: '8:00 AM to 10:00 PM', tip: 'Closes at 10 PM. Not an Oogie Boogie Bash night on Oct 9.' }
  ],
  shows: [
    {
      name: 'Halloween Cavalcade',
      times: '1:30 PM and 2:45 PM',
      where: 'Disneyland parade route (Main Street)',
      tip: 'Claim a curb near Town Square by 1:05 for the 1:30 show. Confirm times in the app.'
    },
    {
      name: 'Halloween Screams with fireworks',
      times: '9:30 PM',
      where: 'Main Street / Sleeping Beauty Castle hub',
      tip: 'Priority evening stop. Claim a curb by 8:15. Sit with the infant. Bring layers.'
    },
    {
      name: 'Fantasmic!',
      times: '9:00 PM and 10:30 PM',
      where: 'Rivers of America, Disneyland',
      tip: 'Optional if the group splits. Screams is the priority.'
    },
    {
      name: 'World of Color ONE',
      times: '9:00 PM and 10:15 PM',
      where: 'Paradise Bay, California Adventure',
      tip: 'Optional DCA show if part of the group stays south.'
    }
  ],
  // Brandon (Corbin's dad, one of the 6 adults) gets motion sick and holds Crew (the infant) on intense rides
  brandon: {
    title: 'Gentle options for Brandon',
    intro: 'Brandon is happy to sit out the intense rides and hold Crew. Here are rides he can enjoy.',
    picks: [
      { name: "Mickey & Minnie's Runaway Railway", note: 'Toontown, on the plan at about 11:30 AM. Whole family rides together.' },
      { name: 'Toy Story Midway Mania!', note: 'Pixar Pier, on the plan at about 4:05 PM. Gentle shooting game ride. Brandon and Crew ride with everyone.' },
      { name: 'Haunted Mansion Holiday', note: 'On the plan at about 10:05 PM. Halloween Time overlay. Slow, smooth Doom Buggies.' },
      { name: 'Pirates of the Caribbean', note: 'On the plan at about 10:45 PM. Slow boat ride with a couple of small drops.' },
      { name: 'Rise of the Resistance', note: 'With the group. No spinning, but a short drop and some motion-sim moments.' },
      { name: 'Radiator Springs Racers', note: 'With the group. Fast, but no spinning.' }
    ],
    extras: [
      { name: "it's a small world", note: 'Very gentle. Open Oct 9 (closes Oct 30 for the holiday refurb).' },
      { name: "Peter Pan's Flight", note: 'Gentle flight over London.' },
      { name: "Tiana's Bayou Adventure", note: 'Maybe. Moderate, with one big drop.' }
    ],
    tips: [
      'Look at the horizon or a fixed point.',
      'Sit up front or by the window when you can.',
      'Some people like ginger chews or motion bands. Bring them if they help.',
      'Eat light before coasters.',
      'Skip the spinning teacups (closed right now anyway).'
    ]
  },
  stops: [
    { id:1, time:'8:00 AM', minutes:8*60, title:'Rope drop: buy passes', park:'dl', height:'any', ll:'Multi Pass + Rise SP', tip:'Phone lead: buy Multi Pass and Rise Single Pass (confirmed) for all 9. Book MP1 Space Mountain.', x:2146, y:2267, icon:'🎟️' },
    { id:2, time:'8:15 AM', minutes:8*60+15, title:'Space Mountain', park:'dl', height:'40"', ll:'LL Multi Pass', tip:'LL line 10 to 15. On tap-in book MP2 Smugglers Run.', x:2965, y:1778, rs:'brandon', motion:true, icon:'🚀' },
    { id:3, time:'9:00 AM', minutes:9*60, title:'Millennium Falcon: Smugglers Run', park:'dl', height:'38"', ll:'LL Multi Pass', tip:'LL line 10 to 15. On tap-in book MP3 Tiana\'s. Walk 20 min from Space first.', x:1232, y:392, rs:'brandon', motion:true, icon:'🛸' },
    { id:4, time:'9:25 AM', minutes:9*60+25, title:'Rise of the Resistance', park:'dl', height:'40"', ll:'Single Pass', tip:'Single Pass confirmed, bought at 8:00. Line 15 to 20, 18 min show. Swap with Smugglers if the window is earlier.', x:505, y:660, rs:'other', bnote:'Brandon rides with the group. Another adult holds Crew and rides after on Rider Switch.', icon:'⭐' },
    { id:5, time:'10:10 AM', minutes:10*60+10, title:'Tiana\'s Bayou Adventure', park:'dl', height:'40"', ll:'LL Multi Pass', tip:'LL line 15. Ponchos. On tap-in book MP4 Big Thunder.', x:382, y:1117, rs:'call', bnote:'Maybe for him. Moderate ride with one big drop.', icon:'💧' },
    { id:6, time:'10:50 AM', minutes:10*60+50, title:'Big Thunder Mountain', park:'dl', height:'40"', ll:'LL Multi Pass', tip:'LL line 10 to 15. On tap-in book MP5 Runaway Railway (scarce today).', x:1547, y:823, rs:'call', bnote:'Bumpy and twisty, but no spinning.', icon:'⛰️' },
    { id:7, time:'11:30 AM', minutes:11*60+30, title:'Mickey & Minnie\'s Runaway Railway', park:'dl', height:'any', ll:'LL Multi Pass', tip:'Toontown. LL line 15. All 10 ride. On tap-in book MP6 Guardians for about 3 PM. Mobile-order lunch in line.', x:2375, y:282, bnote:'Great pick for Brandon. Gentle trackless ride, the whole family rides together.', icon:'🚂' },
    { id:8, time:'12:00 PM', minutes:12*60, title:'Lunch on Main Street', park:'meal', height:'any', ll:'n/a', tip:'Pick up the mobile order, eat, bathrooms. Optional Racers Single Pass: buy by about 12:30 PM if the window shows 2:15 PM or later.', x:2200, y:1800, icon:'🍔' },
    { id:9, time:'1:05 PM', minutes:13*60+5, title:'Halloween Cavalcade', park:'show', height:'any', ll:'n/a', tip:'Curb near Town Square by 1:05. Steps off 1:30. At 1:30 book MP7 Toy Story (2-hour rule).', x:2156, y:1642, icon:'🎭' },
    { id:10, time:'1:50 PM', minutes:13*60+50, title:'Hop to California Adventure', park:'meal', height:'any', ll:'n/a', tip:'Esplanade, 20 to 25 min with post-parade crowds. DCA closes 10 PM.', x:1860, y:2903, icon:'🚶' },
    { id:11, time:'2:20 PM', minutes:14*60+20, title:'Radiator Springs Racers', park:'dca', height:'40"', ll:'SP optional / Single Rider', tip:'Single Pass if bought (line 15 to 20). Otherwise teens and adults use Single Rider (30 to 45). Skip the 90 min standby.', x:1508, y:4120, rs:'other', bnote:'Brandon rides with the group. Another adult holds Crew and rides after on Rider Switch.', icon:'🚗' },
    { id:12, time:'3:15 PM', minutes:15*60+15, title:'Guardians: Monsters After Dark', park:'dca', height:'40"', ll:'LL Multi Pass', tip:'LL line 15. Tapping in here does NOT unlock a new booking (Toy Story is newer). At 3:30 book MP8 Soarin\'.', x:781, y:4611, rs:'brandon', motion:true, icon:'💥' },
    { id:13, time:'4:05 PM', minutes:16*60+5, title:'Toy Story Midway Mania!', park:'dca', height:'any', ll:'LL Multi Pass', tip:'LL line 15. Whole group plays. Snack on Pixar Pier before.', x:2945, y:4048, bnote:'Brandon and Crew ride with everyone. No height limit.', icon:'🎯' },
    { id:14, time:'4:35 PM', minutes:16*60+35, title:'Incredicoaster', park:'dca', height:'48"', ll:'Single Rider', tip:'Single Rider 15 to 25 (standby 40 to 50). Multi Pass is sold out by now.', x:2550, y:3920, rs:'brandon', motion:true, icon:'🎢' },
    { id:15, time:'5:15 PM', minutes:17*60+15, title:'Soarin\' Across America', park:'dca', height:'40"', ll:'LL Multi Pass', tip:'LL line 15 (standby 60 if the return missed). On tap-in book MP9 Grizzly (or Matterhorn if skipping Grizzly).', x:2380, y:5280, rs:'brandon', motion:true, bnote:'Optional for Brandon. The big screen can bother motion-sensitive riders.', icon:'✈️' },
    { id:16, time:'5:50 PM', minutes:17*60+50, title:'Grizzly River Run', park:'dca', height:'42"', ll:'LL Multi Pass', tip:'Optional, first cut if behind. LL line 10. On tap-in book MP10 Matterhorn for about 7:30 to 8:30.', x:2676, y:4927, rs:'call', bnote:'The rafts spin as they go.', icon:'🐻' },
    { id:17, time:'6:20 PM', minutes:18*60+20, title:'Hop back to Disneyland', park:'meal', height:'any', ll:'n/a', tip:'Esplanade back to DL, 20 min. DCA is done well before its 10 PM close.', x:2250, y:2903, icon:'🚶' },
    { id:18, time:'6:45 PM', minutes:18*60+45, title:'Dinner near the hub', park:'meal', height:'any', ll:'n/a', tip:'Plaza Inn (roomy) or mobile orders. Change Crew, charge phones.', x:2456, y:1438, icon:'🍽️' },
    { id:19, time:'7:45 PM', minutes:19*60+45, title:'Matterhorn Bobsleds', park:'dl', height:'42"', ll:'LL Multi Pass', tip:'LL line 15. On tap-in book MP11 Haunted Mansion if any return is left.', x:2755, y:844, rs:'call', bnote:'Short, jerky bobsled ride.', icon:'🏔️' },
    { id:20, time:'8:15 PM', minutes:20*60+15, title:'Claim fireworks spot', park:'show', height:'any', ll:'n/a', tip:'Main Street curb or the hub, 75 min early on a holiday weekend. Bring layers.', x:2130, y:1830, icon:'📍' },
    { id:21, time:'9:30 PM', minutes:21*60+30, title:'Halloween Screams + fireworks', park:'show', height:'any', ll:'n/a', tip:'About 15 min. Let the crowd thin, then walk to New Orleans Square.', x:2146, y:1327, icon:'🎆' },
    { id:22, time:'10:05 PM', minutes:22*60+5, title:'Haunted Mansion Holiday', park:'dl', height:'any', ll:'LL if booked, else Standby', tip:'LL if MP11 worked, else standby 25 to 35. Whole group rides.', x:683, y:1373, bnote:'Gentle Doom Buggies. Brandon and Crew ride with everyone.', icon:'👻' },
    { id:23, time:'10:45 PM', minutes:22*60+45, title:'Pirates of the Caribbean', park:'dl', height:'any', ll:'Standby', tip:'Standby 10 to 20. Whole group. Brandon and Crew can call it a night after.', x:654, y:1580, bnote:'Slow boat ride with a couple of small drops.', icon:'🏴‍☠️' },
    { id:24, time:'11:20 PM', minutes:23*60+20, title:'Big Thunder re-ride', park:'dl', height:'40"', ll:'Standby', tip:'Standby 20 to 30 late (Multi Pass already used).', x:1547, y:823, rs:'call', icon:'⛰️' },
    { id:25, time:'11:50 PM', minutes:23*60+50, title:'Smugglers Run or Space re-ride', park:'dl', height:'38"', ll:'Standby', tip:'Get IN LINE before 12:00 AM, DL closes at midnight. Standby 15 to 25.', x:1232, y:392, rs:'brandon', motion:true, icon:'🌙' },
    { id:26, time:'optional', minutes:21*60, title:'World of Color (optional)', park:'show', height:'any', ll:'n/a', tip:'Not in the plan. Only if you split the party. 9:00 and 10:15 PM at DCA.', x:2929, y:4436, icon:'🌊', optional:true }
  ]
};
