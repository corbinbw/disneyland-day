window.RIDES = {
  parks: [
    { key:'dl', name:'Disneyland Park', short:'Disneyland', lands: [
      { name:'Main Street, U.S.A.', icon:'🎈', rides: [
        { id:'dl-railroad', name:'Disneyland Railroad', tag:'family' },
        { id:'main-street-vehicles', name:'Main Street Vehicles', tag:'family' },
        { id:'walt-magical-life', name:'Walt Disney – A Magical Life', tag:'show' },
        { id:'mr-lincoln', name:'Great Moments with Mr. Lincoln', tag:'show' },
        { id:'main-street-cinema', name:'Main Street Cinema', tag:'show' },
        { id:'disney-gallery', name:'The Disney Gallery', tag:'walk' }
      ]},
      { name:'Adventureland', icon:'🌴', rides: [
        { id:'jungle-cruise', name:'Jungle Cruise', tag:'family' },
        { id:'tiki-room', name:'Walt Disney\'s Enchanted Tiki Room', tag:'show' },
        { id:'adventureland-treehouse', name:'Adventureland Treehouse', tag:'walk' },
        { id:'indiana-jones', name:'Indiana Jones Adventure', tag:'thrill', height:'46"', closed:'Closed for refurbishment' }
      ]},
      { name:'New Orleans Square', icon:'⚜️', rides: [
        { id:'pirates', name:'Pirates of the Caribbean', tag:'family' },
        { id:'haunted-mansion', name:'Haunted Mansion Holiday', tag:'family', note:'Holiday overlay, operating now' }
      ]},
      { name:'Bayou Country', icon:'🐸', rides: [
        { id:'tiana', name:'Tiana\'s Bayou Adventure', tag:'thrill', height:'40"' },
        { id:'winnie-the-pooh', name:'The Many Adventures of Winnie the Pooh', tag:'kids' },
        { id:'davy-crockett-canoes', name:'Davy Crockett\'s Explorer Canoes', tag:'family' }
      ]},
      { name:'Frontierland', icon:'🤠', rides: [
        { id:'big-thunder', name:'Big Thunder Mountain Railroad', tag:'thrill', height:'40"' },
        { id:'mark-twain', name:'Mark Twain Riverboat', tag:'family' },
        { id:'tom-sawyer-island', name:'Pirate\'s Lair on Tom Sawyer Island', tag:'walk' },
        { id:'sailing-ship-columbia', name:'Sailing Ship Columbia', tag:'family', closed:'Not sailing today' }
      ]},
      { name:'Star Wars: Galaxy\'s Edge', icon:'🛸', rides: [
        { id:'smugglers-run', name:'Millennium Falcon: Smugglers Run', tag:'thrill', height:'38"' },
        { id:'rise', name:'Star Wars: Rise of the Resistance', tag:'thrill', height:'40"' }
      ]},
      { name:'Fantasyland', icon:'🏰', rides: [
        { id:'matterhorn', name:'Matterhorn Bobsleds', tag:'thrill', height:'42"' },
        { id:'peter-pan', name:'Peter Pan\'s Flight', tag:'family' },
        { id:'small-world', name:'"it\'s a small world"', tag:'family', note:'Operating now. Closes Oct 30 for the holiday overlay.' },
        { id:'alice', name:'Alice in Wonderland', tag:'family' },
        { id:'mr-toad', name:'Mr. Toad\'s Wild Ride', tag:'family' },
        { id:'snow-white', name:'Snow White\'s Enchanted Wish', tag:'family' },
        { id:'pinocchio', name:'Pinocchio\'s Daring Journey', tag:'family' },
        { id:'dumbo', name:'Dumbo the Flying Elephant', tag:'kids' },
        { id:'carrousel', name:'King Arthur Carrousel', tag:'kids' },
        { id:'casey-jr', name:'Casey Jr. Circus Train', tag:'kids' },
        { id:'storybook-land', name:'Storybook Land Canal Boats', tag:'kids' },
        { id:'castle-walkthrough', name:'Sleeping Beauty Castle Walkthrough', tag:'walk' },
        { id:'mad-tea-party', name:'Mad Tea Party', tag:'family', closed:'Closed for refurbishment (back Oct 16)' }
      ]},
      { name:'Mickey\'s Toontown', icon:'🐭', rides: [
        { id:'runaway-railway', name:'Mickey & Minnie\'s Runaway Railway', tag:'family' },
        { id:'roger-rabbit', name:'Roger Rabbit\'s Car Toon Spin', tag:'family' },
        { id:'gadgetcoaster', name:'Chip \'n\' Dale\'s GADGETcoaster', tag:'family', height:'35"' },
        { id:'mickeys-house', name:'Mickey\'s House and Meet Mickey', tag:'walk' },
        { id:'minnies-house', name:'Minnie\'s House', tag:'walk' },
        { id:'goofy-play-yard', name:'Goofy\'s How-to-Play Yard', tag:'kids' },
        { id:'donald-duck-pond', name:'Donald\'s Duck Pond', tag:'kids' }
      ]},
      { name:'Tomorrowland', icon:'🚀', rides: [
        { id:'space-mountain', name:'Space Mountain', tag:'thrill', height:'40"' },
        { id:'star-tours', name:'Star Tours – The Adventures Continue', tag:'thrill', height:'40"' },
        { id:'buzz-lightyear', name:'Buzz Lightyear Astro Blasters', tag:'family' },
        { id:'nemo-subs', name:'Finding Nemo Submarine Voyage', tag:'family' },
        { id:'autopia', name:'Autopia', tag:'family', height:'32"', note:'54" to drive alone' },
        { id:'astro-orbitor', name:'Astro Orbitor', tag:'family' },
        { id:'monorail', name:'Disneyland Monorail', tag:'family' }
      ]}
    ]},
    { key:'dca', name:'Disney California Adventure', short:'California Adventure', lands: [
      { name:'Hollywood Land', icon:'🎬', rides: [
        { id:'monsters-inc', name:'Monsters, Inc. Mike & Sulley to the Rescue!', tag:'family' },
        { id:'philharmagic', name:'Mickey\'s PhilharMagic', tag:'show' },
        { id:'turtle-talk', name:'Turtle Talk with Crush', tag:'show' },
        { id:'animation-academy', name:'Animation Academy', tag:'show' },
        { id:'sorcerers-workshop', name:'Sorcerer\'s Workshop', tag:'walk' }
      ]},
      { name:'Avengers Campus', icon:'🛡️', rides: [
        { id:'guardians', name:'Guardians of the Galaxy – Mission: BREAKOUT!', tag:'thrill', height:'40"', note:'Monsters After Dark in the afternoon' },
        { id:'web-slingers', name:'WEB SLINGERS: A Spider-Man Adventure', tag:'family' }
      ]},
      { name:'Cars Land', icon:'🚗', rides: [
        { id:'racers', name:'Radiator Springs Racers', tag:'thrill', height:'40"' },
        { id:'luigis', name:'Luigi\'s Rollickin\' Roadsters', tag:'family', height:'32"' },
        { id:'maters', name:'Mater\'s Graveyard JamBOOree', tag:'family', height:'32"', note:'Halloween version of Mater\'s Junkyard Jamboree' }
      ]},
      { name:'Pixar Pier', icon:'🎡', rides: [
        { id:'incredicoaster', name:'Incredicoaster', tag:'thrill', height:'48"' },
        { id:'toy-story', name:'Toy Story Midway Mania!', tag:'family' },
        { id:'pal-a-round', name:'Pixar Pal-A-Round', tag:'family', note:'Swinging or non-swinging gondolas' },
        { id:'inside-out', name:'Inside Out Emotional Whirlwind', tag:'kids' },
        { id:'jessies-carousel', name:'Jessie\'s Critter Carousel', tag:'kids' }
      ]},
      { name:'Paradise Gardens Park', icon:'🌺', rides: [
        { id:'goofys-sky-school', name:'Goofy\'s Sky School', tag:'thrill', height:'42"' },
        { id:'silly-symphony-swings', name:'Silly Symphony Swings', tag:'family', height:'40"', note:'48" to ride solo' },
        { id:'golden-zephyr', name:'Golden Zephyr', tag:'family' },
        { id:'jumpin-jellyfish', name:'Jumpin\' Jellyfish', tag:'kids', height:'40"' },
        { id:'little-mermaid', name:'The Little Mermaid – Ariel\'s Undersea Adventure', tag:'family' }
      ]},
      { name:'San Fransokyo Square', icon:'🌉', rides: [
        { id:'bakery-tour', name:'The Bakery Tour', tag:'walk' }
      ]},
      { name:'Grizzly Peak', icon:'🐻', rides: [
        { id:'grizzly', name:'Grizzly River Run', tag:'thrill', height:'42"' },
        { id:'soarin', name:'Soarin\' Across America', tag:'family', height:'40"' },
        { id:'redwood-creek', name:'Redwood Creek Challenge Trail', tag:'kids' }
      ]}
    ]}
  ],
  // Plan stop title -> ride id. Marking that stop done in the plan also ticks the ride.
  fromPlan: {
    'Space Mountain':'space-mountain',
    'Millennium Falcon: Smugglers Run':'smugglers-run',
    'Rise of the Resistance':'rise',
    'Tiana\'s Bayou Adventure':'tiana',
    'Big Thunder Mountain':'big-thunder',
    'Mickey & Minnie\'s Runaway Railway':'runaway-railway',
    'Radiator Springs Racers':'racers',
    'Guardians: Monsters After Dark':'guardians',
    'Toy Story Midway Mania!':'toy-story',
    'Incredicoaster':'incredicoaster',
    'Soarin\' Across America':'soarin',
    'Grizzly River Run':'grizzly',
    'Matterhorn Bobsleds':'matterhorn',
    'Haunted Mansion Holiday':'haunted-mansion',
    'Pirates of the Caribbean':'pirates',
    'Big Thunder re-ride':'big-thunder'
  }
};
