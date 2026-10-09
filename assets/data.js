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
    { park: 'Disneyland Park', hours: '8:00 AM to 12:00 AM', tip: 'Rope drop at Main Street. Fireworks from Main Street or the castle hub.' },
    { park: 'Disney California Adventure', hours: '8:00 AM to 10:00 PM', tip: 'Not an Oogie Boogie Bash night on Oct 9.' }
  ],
  shows: [
    {
      name: 'Halloween Cavalcade',
      times: '1:30 PM and 2:45 PM',
      where: 'Disneyland parade route (Main Street)',
      tip: 'Claim a curb by 1:00 for the first pass. Confirm times in the app.'
    },
    {
      name: 'Halloween Screams with fireworks',
      times: '9:30 PM',
      where: 'Main Street / Sleeping Beauty Castle hub',
      tip: 'Priority evening stop. Sit on the curb with the infant. Bring layers.'
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
      { name: "Mickey & Minnie's Runaway Railway", note: 'Toontown. Already on the plan at about 6:15 PM. Whole family rides together.' },
      { name: 'Toy Story Midway Mania!', note: 'Pixar Pier, on the plan at about 4:25 PM. Gentle shooting game ride. Brandon and Crew ride with everyone.' },
      { name: 'Haunted Mansion Holiday', note: 'Halloween Time overlay right now. Slow, smooth Doom Buggies.' },
      { name: 'Pirates of the Caribbean', note: 'Slow boat ride with a couple of small drops.' },
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
    { id:1,  time:'8:00 AM',  minutes:8*60,      title:'Rope drop Main Street', park:'dl', height:'any', ll:'Multi Pass booking', tip:'Buy Multi Pass and Rise Single Pass for 9. Book Space Mountain first.', x:2146, y:2267, icon:'🎟️' },
    { id:2,  time:'8:10 AM',  minutes:8*60+10,  title:'Space Mountain', park:'dl', height:'40"', ll:'Multi Pass', tip:'Rebook your next Lightning Lane right after.', x:2965, y:1778, rs:'brandon', motion:true, icon:'🚀' },
    { id:3,  time:'8:45 AM',  minutes:8*60+45,  title:'Rise of the Resistance', park:'dl', height:'40"', ll:'Single Pass', tip:'Single Pass confirmed, family agreed. Buy for all 9 at 8:00 with Multi Pass.', x:505, y:660, rs:'other', bnote:'Brandon can likely ride with the group. No spinning, but a short drop and some motion-sim moments.', icon:'⭐' },
    { id:4,  time:'9:15 AM',  minutes:9*60+15,  title:'Millennium Falcon: Smugglers Run', park:'dl', height:'38"', ll:'Multi Pass', tip:'Right after Rise while you are still in Galaxy\'s Edge.', x:1232, y:392, rs:'brandon', motion:true, icon:'🛸' },
    { id:5,  time:'9:50 AM',  minutes:9*60+50,  title:'Big Thunder Mountain', park:'dl', height:'40"', ll:'Multi Pass', tip:'LL or standby. Snack and diaper break.', x:1547, y:823, rs:'call', bnote:'Bumpy and twisty, but no spinning.', icon:'⛰️' },
    { id:6,  time:'10:30 AM', minutes:10*60+30, title:'Matterhorn Bobsleds', park:'dl', height:'42"', ll:'Multi Pass', tip:'Indy only if reopened (still closed as of Oct 8).', x:2755, y:844, rs:'call', bnote:'Short, jerky bobsled ride.', icon:'🏔️' },
    { id:7,  time:'11:15 AM', minutes:11*60+15, title:"Tiana's Bayou Adventure", park:'dl', height:'40"', ll:'Multi Pass', tip:'You get wet. Bring ponchos.', x:382, y:1117, rs:'call', bnote:'Maybe for him. Moderate ride with one big drop.', icon:'💧' },
    { id:8,  time:'1:30 PM',  minutes:13*60+30, title:'Halloween Cavalcade', park:'show', height:'any', ll:'n/a', tip:'Claim curb by 1:00. Confirm 1:30 / 2:45 in the app.', x:2156, y:1642, icon:'🎭' },
    { id:9,  time:'2:05 PM',  minutes:14*60+5,  title:'Hop to California Adventure', park:'meal', height:'any', ll:'n/a', tip:'Walk across the Esplanade. About 10 to 15 min with stroller.', x:1860, y:2903, icon:'🚶' },
    { id:10, time:'2:25 PM',  minutes:14*60+25, title:'Radiator Springs Racers', park:'dca', height:'40"', ll:'Single Pass', tip:'Optional: Single Pass on DCA entry if available.', x:1508, y:4120, rs:'other', bnote:'Brandon can likely ride with the group. Fast, but no spinning.', icon:'🚗' },
    { id:11, time:'3:20 PM',  minutes:15*60+20, title:'Guardians BREAKOUT!', park:'dca', height:'40"', ll:'Multi Pass', tip:'May be Monsters After Dark after 3 PM.', x:781, y:4611, rs:'brandon', motion:true, icon:'💥' },
    { id:12, time:'4:00 PM',  minutes:16*60,    title:'Incredicoaster', park:'dca', height:'48"', ll:'Multi Pass', tip:'Teens and adults who clear 48 inches.', x:2550, y:3920, rs:'brandon', motion:true, icon:'🎢' },
    { id:13, time:'4:25 PM', minutes:16*60+25, title:'Toy Story Midway Mania!', park:'dca', height:'any', ll:'Multi Pass', tip:'Pixar Pier, right next to Incredicoaster. Gentle shooting dark ride, everyone plays.', x:2945, y:4048, bnote:'Brandon and Crew ride with everyone. No height limit.', icon:'🎯' },
    { id:14, time:'4:55 PM', minutes:16*60+55, title:"Soarin' Across America", park:'dca', height:'40"', ll:'Multi Pass', tip:'Dry, chill break. Book Runaway Railway Multi Pass for about 6:15 PM.', x:2380, y:5280, rs:'brandon', motion:true, bnote:'Optional for Brandon. Gentle for most people, but the big screen can bother motion-sensitive riders.', icon:'✈️' },
    { id:15, time:'5:25 PM', minutes:17*60+25, title:'Grizzly River Run', park:'dca', height:'42"', ll:'Multi Pass', tip:'Optional if behind. Skip if tired or short on dry clothes. You will get wet.', x:2676, y:4927, rs:'call', bnote:'The rafts spin as they go.', icon:'🐻' },
    { id:16, time:'6:00 PM', minutes:18*60, title:'Hop back to Disneyland', park:'meal', height:'any', ll:'n/a', tip:'Esplanade back to DL. Head up Main Street toward Toontown.', x:2250, y:2903, icon:'🚶' },
    { id:17, time:'6:15 PM', minutes:18*60+15, title:"Mickey & Minnie's Runaway Railway", park:'dl', height:'any', ll:'Multi Pass', tip:'Mickey\'s Toontown, back of Disneyland. No height limit, so all 10 ride together, infant too.', x:2375, y:282, bnote:'Great pick for Brandon too. Gentle trackless ride, the whole family rides together.', icon:'🚂' },
    { id:18, time:'7:00 PM', minutes:19*60, title:'Dinner near the hub', park:'meal', height:'any', ll:'n/a', tip:'Plaza Inn (roomy) or mobile order. Change the infant and charge phones.', x:2456, y:1438, icon:'🍽️' },
    { id:19, time:'8:40 PM',  minutes:20*60+40, title:'Claim fireworks spot', park:'show', height:'any', ll:'n/a', tip:'Main Street curb facing the castle, or the hub. Sit with the infant. Bring layers.', x:2130, y:1830, icon:'📍' },
    { id:20, time:'optional', minutes:21*60,    title:'World of Color (optional)', park:'show', height:'any', ll:'n/a', tip:'Only if you split the party. 9:00 and 10:15 PM at DCA.', x:2929, y:4436, icon:'🌊', optional:true },
    { id:21, time:'9:30 PM',  minutes:21*60+30, title:'Halloween Screams + fireworks', park:'show', height:'any', ll:'n/a', tip:'Main Street or castle plaza. Sit on the curb with infant.', x:2146, y:1327, icon:'🎆' }
  ]
};
