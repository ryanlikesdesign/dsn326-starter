/* ============================================================
   Heard Line — Taquería La Brasa, expo rail

   Ticket data, 86 board, and the table/course state the handheld
   and the terminal read from.

   The restaurant is the same one Heard Guest orders from. Tickets
   marked "Heard Guest" arrived through the ordering app; the rest
   were rung in by a server on the floor.
   ============================================================ */

const SERVICE = {
  restaurant: 'Taquería La Brasa',
  station: 'Expo · Pass',
  /* Elapsed-time bands, in minutes. The system has no per-item target
     times, so these are the same for a salad and a well-done steak. */
  bands: { ok: 8, approaching: 12, late: 16 },
  /* How many tickets fit across the 15-inch pass display. */
  railCapacity: 6,
};


/* --- Tickets ---------------------------------------------------
   status: incoming | started | ready | bumped | recalled
   receivedMinutesAgo is fixed at load; elapsed counts up from it.
   --------------------------------------------------------------- */

const TICKETS = [
  {
    id: 'T-2208',
    number: '2208',
    source: 'Table 12',
    server: 'Jess',
    course: 'Mains',
    receivedMinutesAgo: 17.4,
    status: 'started',
    recallCount: 0,
    items: [
      { name: 'Al Pastor Taco', qty: 3, mods: ['No onion', 'Flour tortilla', 'Salsa roja'] },
      { name: 'Carne Asada Taco', qty: 2, mods: ['Extra guacamole'] },
      { name: 'Chicken Tinga Burrito', qty: 1, mods: ['No rice', 'Dairy allergy - no crema no che'] },
      { name: 'Elote', qty: 2, mods: ['Off the cob'] },
      { name: 'Frijoles Charros', qty: 1, mods: [] },
    ],
  },
  {
    id: 'T-2211',
    number: '2211',
    source: 'Table 4',
    server: 'Jess',
    course: 'Mains',
    receivedMinutesAgo: 13.1,
    status: 'started',
    recallCount: 0,
    items: [
      { name: 'Barbacoa Burrito', qty: 1, mods: ['No beans', 'Wet, salsa roja on top'] },
      { name: 'Carnitas Taco', qty: 2, mods: ['Corn tortilla', 'Habanero'] },
      { name: 'Chips & Guacamole', qty: 1, mods: [] },
    ],
  },
  {
    id: 'T-2214',
    number: 'A4471',
    source: 'Heard Guest · Pickup',
    server: null,
    course: null,
    receivedMinutesAgo: 9.6,
    status: 'incoming',
    recallCount: 0,
    items: [
      { name: 'Al Pastor Taco', qty: 2, mods: ['Corn tortilla', 'Salsa verde'] },
      { name: 'Nopales y Hongos Taco', qty: 2, mods: ['No cilantro'] },
      { name: 'Chips & Guacamole', qty: 1, mods: [] },
      { name: 'Agua de Jamaica', qty: 1, mods: ['Large'] },
    ],
  },
  {
    id: 'T-2216',
    number: '2216',
    source: 'Table 7',
    server: 'Marcus',
    course: 'Mains',
    receivedMinutesAgo: 6.8,
    status: 'incoming',
    recallCount: 0,
    items: [
      { name: 'Carne Asada Taco', qty: 4, mods: ['Corn tortilla', 'No onion', 'Salsa verde on the side'] },
      { name: 'Al Pastor Taco', qty: 2, mods: ['No pineapple'] },
      { name: 'Sweet Potato & Poblano Bowl', qty: 1, mods: ['Cilantro-lime rice', 'Vegetarian'] },
      { name: 'Barbacoa Burrito', qty: 1, mods: ['Pinto beans', 'Extra salsa on the side'] },
      { name: 'Elote', qty: 3, mods: ['On the cob', 'No chile powder'] },
      { name: 'Arroz Rojo', qty: 2, mods: [] },
    ],
  },
  {
    id: 'T-2219',
    number: '2219',
    source: 'Bar 2',
    server: 'Ravi',
    course: null,
    receivedMinutesAgo: 3.9,
    status: 'incoming',
    recallCount: 0,
    items: [
      { name: 'Carnitas Taco', qty: 2, mods: ['Flour tortilla'] },
      { name: 'Frijoles Charros', qty: 1, mods: [] },
    ],
  },
  {
    id: 'T-2221',
    number: 'A4474',
    source: 'Heard Guest · Pickup',
    server: null,
    course: null,
    receivedMinutesAgo: 1.6,
    status: 'incoming',
    recallCount: 0,
    items: [
      { name: 'Carnitas Taco', qty: 2, mods: ['Corn tortilla', 'Salsa roja'] },
      { name: 'Chips & Guacamole', qty: 1, mods: [] },
      { name: 'Mexican Coca-Cola', qty: 1, mods: [] },
    ],
  },
  {
    id: 'T-2203',
    number: '2203',
    source: 'Table 9',
    server: 'Jess',
    course: 'Mains',
    receivedMinutesAgo: 24.2,
    status: 'bumped',
    recallCount: 0,
    items: [
      { name: 'Al Pastor Taco', qty: 3, mods: ['Corn tortilla'] },
      { name: 'Chips & Guacamole', qty: 1, mods: [] },
      { name: 'Horchata', qty: 2, mods: [] },
    ],
  },
  {
    id: 'T-2199',
    number: '2199',
    source: 'Table 3',
    server: 'Marcus',
    course: 'Mains',
    receivedMinutesAgo: 28.7,
    status: 'recalled',
    /* Sent back twice. Nothing on the ticket says so. */
    recallCount: 2,
    /* L13 — handoff data that exists and never renders. The day expo left a
       note and an owner; the rail shows neither, and there is no sign-in. */
    note: 'Do not refire until Table 3 confirms — second remake.',
    enteredBy: 'Priya (day expo, clocked out 3:45)',
    items: [
      { name: 'Carne Asada Taco', qty: 2, mods: ['Medium rare', 'No onion'] },
      { name: 'Barbacoa Burrito', qty: 1, mods: ['Black beans'] },
      { name: 'Elote', qty: 1, mods: [] },
      { name: 'Arroz Rojo', qty: 1, mods: [] },
    ],
  },
];


/* --- 86 board ---------------------------------------------------
   What the kitchen has run out of. The pass display is where it gets
   marked. Servers and Heard Guest find out on their own schedule.
   --------------------------------------------------------------- */

const EIGHTY_SIX = [
  { id: 'taco-pescado', name: 'Baja Fish Taco', off: true,  markedMinutesAgo: 41 },
  { id: 'drink-horchata', name: 'Horchata',     off: true,  markedMinutesAgo: 12 },
  { id: 'side-elote',   name: 'Elote',          off: false, markedMinutesAgo: null },
  { id: 'taco-nopal',   name: 'Nopales y Hongos Taco', off: false, markedMinutesAgo: null },
];


/* --- Floor state ------------------------------------------------
   What the handheld shows and what the terminal can act on.
   --------------------------------------------------------------- */

const TABLES = [
  { id: 'T4',  label: 'Table 4',  section: 'A', server: 'Jess',   covers: 2,
    courses: [ { name: 'Starters', state: 'fired' }, { name: 'Mains', state: 'fired' }, { name: 'Dessert', state: 'held' } ] },
  { id: 'T7',  label: 'Table 7',  section: 'B', server: 'Marcus', covers: 6,
    courses: [ { name: 'Starters', state: 'fired' }, { name: 'Mains', state: 'held' }, { name: 'Dessert', state: 'held' } ] },
  { id: 'T9',  label: 'Table 9',  section: 'A', server: 'Jess',   covers: 4,
    courses: [ { name: 'Starters', state: 'fired' }, { name: 'Mains', state: 'fired' }, { name: 'Dessert', state: 'held' } ] },
  { id: 'T12', label: 'Table 12', section: 'A', server: 'Jess',   covers: 5,
    courses: [ { name: 'Starters', state: 'fired' }, { name: 'Mains', state: 'fired' }, { name: 'Dessert', state: 'held' } ] },
  { id: 'T3',  label: 'Table 3',  section: 'B', server: 'Marcus', covers: 3,
    courses: [ { name: 'Starters', state: 'fired' }, { name: 'Mains', state: 'fired' }, { name: 'Dessert', state: 'held' } ] },
  { id: 'T15', label: 'Table 15', section: 'B', server: 'Marcus', covers: 8,
    courses: [ { name: 'Starters', state: 'held' }, { name: 'Mains', state: 'held' }, { name: 'Dessert', state: 'held' } ] },
];
