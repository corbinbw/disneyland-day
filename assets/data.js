window.PLAN = {
  date: '2026-10-09',
  timezone: 'America/Los_Angeles',
  map: { w: 3719, h: 6000, file: 'assets/resort_map.webp', fallback: 'assets/resort_map.jpg' },
  group: '6 adults, 3 teens, 1 infant · 9 paid tickets · Indiana Jones closed',
  hours: { dl: 'DL 8 AM to 12 AM', dca: 'DCA 8 AM to 10 PM' },
  shows: [
    { name: 'Halloween Cavalcade', times: '1:30 PM and 2:45 PM', where: 'Disneyland parade route' },
    { name: 'Halloween Screams with fireworks', times: '9:30 PM', where: 'Main Street / castle hub' },
    { name: 'Fantasmic!', times: '9:00 PM and 10:30 PM', where: 'Rivers of America' },
    { name: 'World of Color ONE', times: '9:00 PM and 10:15 PM', where: 'Paradise Bay, DCA' }
  ],
  stops: [
    { id:1,  time:'8:00 AM',  minutes:8*60,      title:'Rope drop Main Street', park:'dl', height:'any', ll:'Multi Pass booking', tip:'Buy Multi Pass for 9. Book Space Mountain first.', x:2146, y:2267, icon:'🎟️' },
    { id:2,  time:'8:10 AM',  minutes:8*60+10,  title:'Space Mountain', park:'dl', height:'40"', ll:'Multi Pass', tip:'Rider Switch for infant. Rebook next LL after.', x:2965, y:1778, icon:'🚀' },
    { id:3,  time:'8:45 AM',  minutes:8*60+45,  title:'Rise + Smugglers Run', park:'dl', height:'40" / 38"', ll:'Single Pass (Rise) · Multi Pass (Falcon)', tip:'Single Pass or standby for Rise, then Falcon.', x:1232, y:392, icon:'⭐' },
    { id:4,  time:'9:50 AM',  minutes:9*60+50,  title:'Big Thunder Mountain', park:'dl', height:'40"', ll:'Multi Pass', tip:'LL or standby. Snack and diaper break.', x:1547, y:823, icon:'⛰️' },
    { id:5,  time:'10:30 AM', minutes:10*60+30, title:'Matterhorn Bobsleds', park:'dl', height:'42"', ll:'Multi Pass', tip:'Indy only if reopened (still closed as of Oct 8).', x:2755, y:844, icon:'🏔️' },
    { id:6,  time:'11:15 AM', minutes:11*60+15, title:"Tiana's Bayou Adventure", park:'dl', height:'40"', ll:'Multi Pass', tip:'You get wet. Rider Switch. Bring ponchos.', x:382, y:1117, icon:'💧' },
    { id:7,  time:'1:30 PM',  minutes:13*60+30, title:'Halloween Cavalcade', park:'show', height:'any', ll:'n/a', tip:'Claim curb by 1:00. Confirm 1:30 / 2:45 in the app.', x:2156, y:1642, icon:'🎭' },
    { id:8,  time:'2:05 PM',  minutes:14*60+5,  title:'Hop via Esplanade', park:'meal', height:'any', ll:'n/a', tip:'~10 to 15 min with stroller. Hopping allowed from 11 AM.', x:1860, y:2903, icon:'🚶' },
    { id:9,  time:'2:25 PM',  minutes:14*60+25, title:'Radiator Springs Racers', park:'dca', height:'40"', ll:'Single Pass', tip:'Buy Single Pass on DCA entry if available.', x:1508, y:4120, icon:'🚗' },
    { id:10, time:'3:20 PM',  minutes:15*60+20, title:'Guardians BREAKOUT!', park:'dca', height:'40"', ll:'Multi Pass', tip:'May be Monsters After Dark after 3 PM.', x:781, y:4611, icon:'💥' },
    { id:11, time:'4:00 PM',  minutes:16*60,    title:'Incredicoaster', park:'dca', height:'48"', ll:'Multi Pass', tip:'Teens/adults who clear height. Infant rests nearby.', x:2550, y:3920, icon:'🎢' },
    { id:12, time:'4:40 PM',  minutes:16*60+40, title:"Soarin' + Grizzly", park:'dca', height:'40" / 42"', ll:'Multi Pass', tip:"Soarin' Across America first. Skip Grizzly if tired.", x:2550, y:5200, icon:'✈️' },
    { id:13, time:'optional', minutes:21*60,    title:'World of Color', park:'show', height:'any', ll:'n/a', tip:'Optional if you split the party. 9:00 and 10:15 PM.', x:2929, y:4436, icon:'🌊', optional:true },
    { id:14, time:'9:30 PM',  minutes:21*60+30, title:'Halloween Screams + fireworks', park:'show', height:'any', ll:'n/a', tip:'Main Street or castle plaza. Sit on the curb with infant.', x:2146, y:1327, icon:'🎆' }
  ]
};
