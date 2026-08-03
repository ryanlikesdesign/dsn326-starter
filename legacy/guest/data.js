/* ============================================================
   Heard Guest — Taquería La Brasa
   Menu data, modifier groups, and demo states.

   This is content, not design. Nothing in here is a Rail concern.
   ============================================================ */

/* --- Restaurant ------------------------------------------------ */

const RESTAURANT = {
  name: 'Taquería La Brasa',
  neighborhood: '1841 Alum Rock Ave',
  // Set by the restaurant in their Heard dashboard. Never recalculated.
  defaultPrepMinutes: 20,
  // Restaurants set their own service fee, 0–18% (see HEARD-204).
  serviceFeeRate: 0.12,
  taxRate: 0.0825,
};


/* --- Modifier groups ------------------------------------------- */

const MODIFIER_GROUPS = {
  tortilla: {
    id: 'tortilla',
    label: 'Tortilla',
    type: 'single',
    options: [
      { id: 'corn', label: 'Corn', price: 0 },
      { id: 'flour', label: 'Flour', price: 0 },
      { id: 'lettuce', label: 'Lettuce wrap', price: 0 },
    ],
    defaultOption: 'corn',
  },

  salsa: {
    id: 'salsa',
    label: 'Salsa',
    type: 'single',
    options: [
      { id: 'verde', label: 'Salsa verde', price: 0 },
      { id: 'roja', label: 'Salsa roja', price: 0 },
      { id: 'habanero', label: 'Habanero (hot)', price: 0 },
      { id: 'none', label: 'No salsa', price: 0 },
    ],
    defaultOption: 'verde',
  },

  tacoExtras: {
    id: 'tacoExtras',
    label: 'Extras',
    type: 'multi',
    options: [
      { id: 'queso', label: 'Queso fresco', price: 1.0 },
      { id: 'guac', label: 'Guacamole', price: 2.0 },
      { id: 'noonion', label: 'No onion', price: 0 },
      { id: 'nocilantro', label: 'No cilantro', price: 0 },
    ],
    defaultOption: null,
  },

  rice: {
    id: 'rice',
    label: 'Rice',
    type: 'single',
    options: [
      { id: 'mexican', label: 'Mexican rice', price: 0 },
      { id: 'cilantro', label: 'Cilantro-lime rice', price: 0 },
      { id: 'norice', label: 'No rice', price: 0 },
    ],
    defaultOption: 'mexican',
  },

  beans: {
    id: 'beans',
    label: 'Beans',
    type: 'single',
    options: [
      { id: 'black', label: 'Black beans', price: 0 },
      { id: 'pinto', label: 'Pinto beans', price: 0 },
      { id: 'nobeans', label: 'No beans', price: 0 },
    ],
    defaultOption: 'black',
  },

  burritoExtras: {
    id: 'burritoExtras',
    label: 'Extras',
    type: 'multi',
    options: [
      { id: 'guac', label: 'Guacamole', price: 2.5 },
      { id: 'crema', label: 'Crema', price: 0.75 },
      { id: 'wet', label: 'Make it wet (salsa roja on top)', price: 1.5 },
      { id: 'extrasalsa', label: 'Extra salsa on the side', price: 0 },
    ],
    defaultOption: null,
  },

  eloteStyle: {
    id: 'eloteStyle',
    label: 'Served',
    type: 'single',
    options: [
      { id: 'cob', label: 'On the cob', price: 0 },
      { id: 'cup', label: 'Off the cob, in a cup', price: 0 },
    ],
    defaultOption: 'cob',
  },

  drinkSize: {
    id: 'drinkSize',
    label: 'Size',
    type: 'single',
    options: [
      { id: 'regular', label: 'Regular (16 oz)', price: 0 },
      { id: 'large', label: 'Large (24 oz)', price: 1.25 },
    ],
    defaultOption: 'regular',
  },
};


/* --- Menu ------------------------------------------------------ */

const MENU = [
  {
    id: 'tacos',
    label: 'Tacos',
    note: 'Served on two corn tortillas unless you say otherwise.',
    items: [
      {
        id: 'taco-pastor',
        name: 'Al Pastor Taco',
        price: 4.25,
        description: 'Spit-roasted marinated pork, grilled pineapple, white onion, cilantro.',
        groups: ['tortilla', 'salsa', 'tacoExtras'],
        available: true,
      },
      {
        id: 'taco-asada',
        name: 'Carne Asada Taco',
        price: 4.75,
        description: 'Grilled skirt steak, white onion, cilantro, lime.',
        groups: ['tortilla', 'salsa', 'tacoExtras'],
        available: true,
      },
      {
        id: 'taco-carnitas',
        name: 'Carnitas Taco',
        price: 4.5,
        description: 'Pork shoulder confited slow, then crisped on the plancha.',
        groups: ['tortilla', 'salsa', 'tacoExtras'],
        available: true,
      },
      {
        id: 'taco-pescado',
        name: 'Baja Fish Taco',
        price: 5.25,
        description: 'Beer-battered rockfish, cabbage slaw, chipotle crema, pickled red onion.',
        groups: ['tortilla', 'salsa', 'tacoExtras'],
        // 86'd by the kitchen this morning.
        available: false,
      },
      {
        id: 'taco-nopal',
        name: 'Nopales y Hongos Taco',
        price: 4.0,
        description: 'Grilled cactus paddle, oyster mushrooms, queso fresco, toasted pepitas.',
        groups: ['tortilla', 'salsa', 'tacoExtras'],
        available: true,
      },
    ],
  },

  {
    id: 'burritos',
    label: 'Burritos & Bowls',
    note: 'Bowls come in a compostable container. Burritos come wrapped in foil.',
    items: [
      {
        id: 'burrito-barbacoa',
        name: 'Slow-Braised Beef Barbacoa Burrito with Black Beans, Mexican Rice and Salsa Roja',
        price: 13.5,
        description: 'Chuck braised overnight with guajillo and bay, wrapped in a flour tortilla.',
        groups: ['rice', 'beans', 'burritoExtras'],
        available: true,
      },
      {
        id: 'burrito-tinga',
        name: 'Chicken Tinga Burrito',
        price: 12.0,
        description: 'Shredded chicken in chipotle and tomato, lettuce, queso fresco.',
        groups: ['rice', 'beans', 'burritoExtras'],
        available: true,
      },
      {
        id: 'bowl-camote',
        name: 'Sweet Potato & Poblano Bowl',
        price: 11.75,
        description: 'Roasted sweet potato, charred poblano, pepitas, salsa verde.',
        groups: ['rice', 'beans', 'burritoExtras'],
        available: true,
      },
    ],
  },

  {
    id: 'sides',
    label: 'Sides',
    note: '',
    items: [
      {
        id: 'side-guac',
        name: 'Chips & Guacamole',
        price: 7.5,
        description: 'Made to order. Chips fried this morning.',
        groups: [],
        available: true,
      },
      {
        id: 'side-elote',
        name: 'Elote',
        price: 5.0,
        description: 'Grilled corn, crema, cotija, chile powder, lime.',
        groups: ['eloteStyle'],
        available: true,
      },
      {
        id: 'side-frijoles',
        name: 'Frijoles Charros',
        price: 4.5,
        description: 'Pinto beans simmered with bacon, chorizo, and jalapeño.',
        groups: [],
        available: true,
      },
      {
        id: 'side-arroz',
        name: 'Arroz Rojo',
        price: 3.5,
        description: 'Tomato rice with peas and carrot.',
        groups: [],
        available: true,
      },
    ],
  },

  {
    id: 'drinks',
    label: 'Drinks',
    note: '',
    items: [
      {
        id: 'drink-horchata',
        name: 'Horchata',
        price: 4.0,
        description: 'Rice and cinnamon, made in house every morning.',
        groups: ['drinkSize'],
        /* G12 — the Line 86 board marked Horchata off 12 minutes ago. The
           stated cache window is 4 minutes. Guest still sells it, the demo
           group order contains three, and nothing on either surface says so. */
        available: true,
      },
      {
        id: 'drink-jamaica',
        name: 'Agua de Jamaica',
        price: 4.0,
        description: 'Hibiscus, lightly sweetened.',
        groups: ['drinkSize'],
        available: true,
      },
      {
        id: 'drink-coke',
        name: 'Mexican Coca-Cola',
        price: 3.75,
        description: 'Glass bottle, cane sugar.',
        groups: [],
        available: true,
      },
      {
        id: 'drink-topo',
        name: 'Topo Chico',
        price: 3.25,
        description: 'Mineral water, glass bottle.',
        groups: [],
        available: true,
      },
    ],
  },
];


/* --- Promo codes ----------------------------------------------- */

const PROMO_CODES = {
  FARO5: { code: 'FARO5', label: '$5 off', amount: 5.0 },
};


/* --- Previous order (powers "Order again") ---------------------- */
/* The fish taco was available when this order was placed. It isn't now. */

const PREVIOUS_ORDER = {
  placedOn: 'Thursday',
  lines: [
    { itemId: 'taco-pastor', qty: 2, mods: { tortilla: ['corn'], salsa: ['verde'], tacoExtras: [] }, instructions: '' },
    { itemId: 'taco-pescado', qty: 1, mods: { tortilla: ['corn'], salsa: ['verde'], tacoExtras: ['noonion'] }, instructions: '' },
    { itemId: 'side-guac', qty: 1, mods: {}, instructions: '' },
    { itemId: 'drink-horchata', qty: 1, mods: { drinkSize: ['regular'] }, instructions: '' },
  ],
};


/* --- Group order demo state (?demo=group) ----------------------- */
/* 22 line items. Names typed into the special-instructions boxes,
   which is how an office order actually arrives. */

const GROUP_DEMO_LINES = [
  { itemId: 'taco-pastor',      qty: 2, mods: { tortilla: ['corn'],  salsa: ['verde'],    tacoExtras: [] },                instructions: 'for Priya' },
  { itemId: 'taco-asada',       qty: 1, mods: { tortilla: ['corn'],  salsa: ['roja'],     tacoExtras: ['noonion'] },       instructions: 'Marcus - no onion' },
  { itemId: 'taco-carnitas',    qty: 2, mods: { tortilla: ['flour'], salsa: ['verde'],    tacoExtras: [] },                instructions: 'Jordan - no cilantro, extra lime, and please put the salsa on the side' },
  { itemId: 'burrito-tinga',    qty: 1, mods: { rice: ['mexican'],   beans: ['black'],    burritoExtras: [] },             instructions: 'for Sam (front desk)' },
  { itemId: 'burrito-barbacoa', qty: 1, mods: { rice: ['mexican'],   beans: ['nobeans'],  burritoExtras: ['guac'] },       instructions: 'Ali - no beans' },
  { itemId: 'bowl-camote',      qty: 1, mods: { rice: ['cilantro'],  beans: ['black'],    burritoExtras: [] },             instructions: 'Wen - vegetarian' },
  { itemId: 'taco-nopal',       qty: 2, mods: { tortilla: ['corn'],  salsa: ['verde'],    tacoExtras: [] },                instructions: 'Wen + Theo' },
  { itemId: 'side-guac',        qty: 2, mods: {},                                                                          instructions: 'for the table' },
  { itemId: 'side-elote',       qty: 1, mods: { eloteStyle: ['cob'] },                                                     instructions: 'Priya' },
  { itemId: 'side-frijoles',    qty: 1, mods: {},                                                                          instructions: 'Marcus' },
  { itemId: 'side-arroz',       qty: 1, mods: {},                                                                          instructions: '' },
  { itemId: 'drink-horchata',   qty: 3, mods: { drinkSize: ['regular'] },                                                  instructions: 'Priya, Dana, Sam' },
  { itemId: 'drink-jamaica',    qty: 2, mods: { drinkSize: ['regular'] },                                                  instructions: 'Theo and Ali' },
  { itemId: 'drink-coke',       qty: 2, mods: {},                                                                          instructions: 'Marcus + Jordan' },
  { itemId: 'drink-topo',       qty: 1, mods: {},                                                                          instructions: 'Wen' },
  { itemId: 'taco-pastor',      qty: 1, mods: { tortilla: ['corn'],  salsa: ['none'],     tacoExtras: [] },                instructions: 'Theo - no pineapple if possible' },
  { itemId: 'taco-asada',       qty: 1, mods: { tortilla: ['flour'], salsa: ['habanero'], tacoExtras: ['guac'] },          instructions: 'Jordan' },
  { itemId: 'burrito-tinga',    qty: 1, mods: { rice: ['norice'],    beans: ['black'],    burritoExtras: [] },             instructions: 'Nia - dairy allergy, no crema and no cheese, this one is important' },
  { itemId: 'side-guac',        qty: 1, mods: {},                                                                          instructions: 'Nia' },
  { itemId: 'drink-horchata',   qty: 1, mods: { drinkSize: ['large'] },                                                    instructions: 'Nia' },
  { itemId: 'taco-carnitas',    qty: 1, mods: { tortilla: ['corn'],  salsa: ['roja'],     tacoExtras: ['queso'] },         instructions: 'Ravi' },
  { itemId: 'side-elote',       qty: 1, mods: { eloteStyle: ['cup'] },                                                     instructions: 'Ravi - off the cob' },
];


/* --- Lookup helpers -------------------------------------------- */

const ALL_ITEMS = MENU.reduce((all, section) => all.concat(section.items), []);

function findItem(itemId) {
  return ALL_ITEMS.find((item) => item.id === itemId) || null;
}

function findGroup(groupId) {
  return MODIFIER_GROUPS[groupId] || null;
}

function findOption(groupId, optionId) {
  const group = findGroup(groupId);
  if (!group) return null;
  return group.options.find((option) => option.id === optionId) || null;
}
