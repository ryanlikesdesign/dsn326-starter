/* ============================================================
   Heard Guest — checkout flow

   Six screens: menu → cart → time → tip → pay → confirmation.
   Phone width, comfortable density, standard environment.
   ============================================================ */

(function () {
  'use strict';

  /* --- Screen order ------------------------------------------- */

  const SCREENS = ['menu', 'cart', 'time', 'tip', 'pay', 'confirm'];

  const SCREEN_META = {
    menu:    { title: 'Taquería La Brasa', eyebrow: 'Pickup',   step: null, cta: 'Go to your order' },
    cart:    { title: 'Your order',        eyebrow: 'Step 1',   step: '1 of 5', cta: 'Choose a pickup time' },
    time:    { title: 'Pickup time',       eyebrow: 'Step 2',   step: '2 of 5', cta: 'Add a tip' },
    tip:     { title: 'Add a tip',         eyebrow: 'Step 3',   step: '3 of 5', cta: 'Go to payment' },
    pay:     { title: 'Payment',           eyebrow: 'Step 4',   step: '4 of 5', cta: 'Place order' },
    confirm: { title: 'Order placed',      eyebrow: 'Done',     step: '5 of 5', cta: null },
  };

  const PAYMENT_METHODS = [
    { id: 'applepay', label: 'Apple Pay',            detail: 'Fastest',            mark: '&#63743;' },
    { id: 'saved',    label: 'Visa ending 4471',     detail: 'Saved on this phone', mark: '&#128179;' },
    { id: 'newcard',  label: 'New credit or debit card', detail: '',               mark: '&#43;' },
    { id: 'cash',     label: 'Cash at pickup',       detail: 'Pay at the window',  mark: '&#128176;' },
  ];


  /* --- State --------------------------------------------------- */

  const state = {
    screen: 'menu',
    section: MENU[0].id,
    lines: [],
    nextLineId: 1,
    promoInput: '',
    promoApplied: null,
    pickupSlot: 'asap',
    phone: '',
    tipPercent: 22,
    tipCustom: null,
    paymentMethod: null,
    utensils: false,
    orderNumber: null,
    sheet: null,
    pendingRemoval: null,
  };


  /* --- Money --------------------------------------------------- */

  const money = (n) => '$' + (Math.round(n * 100) / 100).toFixed(2);

  function lineUnitPrice(line) {
    const item = findItem(line.itemId);
    if (!item) return 0;
    let price = item.price;
    Object.keys(line.mods || {}).forEach((groupId) => {
      (line.mods[groupId] || []).forEach((optionId) => {
        const option = findOption(groupId, optionId);
        if (option) price += option.price;
      });
    });
    return price;
  }

  const lineTotal = (line) => lineUnitPrice(line) * line.qty;
  const itemCount = () => state.lines.reduce((n, line) => n + line.qty, 0);
  const subtotal = () => state.lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const discount = () => (state.promoApplied ? Math.min(state.promoApplied.amount, subtotal()) : 0);
  const serviceFee = () => (subtotal() - discount()) * RESTAURANT.serviceFeeRate;
  const tax = () => (subtotal() - discount() + serviceFee()) * RESTAURANT.taxRate;

  /* Everything the guest must pay before a tip is chosen. Legal requires
     this number on the first price screen. */
  const preTipTotal = () => subtotal() - discount() + serviceFee() + tax();

  /* The base the tip percentage is applied to. */
  function tipBase() {
    return preTipTotal();
  }

  function tipAmount() {
    if (state.tipCustom !== null) return state.tipCustom;
    if (state.tipPercent === null) return 0;
    return tipBase() * (state.tipPercent / 100);
  }

  const grandTotal = () => preTipTotal() + tipAmount();


  /* --- Quoted pickup time --------------------------------------- */

  /* The restaurant sets one prep time in its dashboard and that is the
     number we quote. Guest does not read Line's ticket state. */
  function quotedMinutes() {
    return RESTAURANT.defaultPrepMinutes;
  }

  /* Stamped once when the page loads and never recalculated, so the
     estimate drifts further from the truth the longer anyone shops. */
  const QUOTED_AT = new Date(Date.now() + RESTAURANT.defaultPrepMinutes * 60000);

  function quotedClockTime() {
    return QUOTED_AT.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }


  /* --- DOM helpers ---------------------------------------------- */

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(message, variant) {
    const region = $('toast-region');
    const node = el('div', 'rail-toast rail-toast--' + (variant || 'info'));
    node.setAttribute('role', 'alert');
    node.innerHTML =
      '<div class="rail-toast__icon" aria-hidden="true">&#9679;</div>' +
      '<div class="rail-toast__content"><span class="rail-toast__message">' +
      escapeHtml(message) + '</span></div>' +
      '<button class="rail-toast__dismiss" aria-label="Dismiss">&times;</button>';
    node.querySelector('.rail-toast__dismiss').addEventListener('click', () => node.remove());
    region.appendChild(node);
    setTimeout(() => {
      node.classList.add('rail-toast--exiting');
      setTimeout(() => node.remove(), 220);
    }, 4200);
  }


  /* --- Modifier summary ------------------------------------------ */

  function modSummary(line) {
    const item = findItem(line.itemId);
    if (!item) return '';
    const parts = [];
    (item.groups || []).forEach((groupId) => {
      const group = findGroup(groupId);
      if (!group) return;
      (line.mods[groupId] || []).forEach((optionId) => {
        const option = findOption(groupId, optionId);
        if (!option) return;
        if (group.type === 'single' && group.defaultOption === optionId) return;
        parts.push(option.label);
      });
    });
    return parts.join(' · ');
  }


  /* --- Cart mutation --------------------------------------------- */

  /* The instructions column is 40 characters wide in the orders table.
     Anything longer is cut to fit on the way in. */
  const INSTRUCTIONS_LIMIT = 40;

  function addLine(itemId, qty, mods, instructions) {
    state.lines.push({
      lineId: state.nextLineId++,
      itemId: itemId,
      qty: qty,
      mods: mods || {},
      instructions: (instructions || '').slice(0, INSTRUCTIONS_LIMIT),
    });
  }

  function defaultMods(item) {
    const mods = {};
    (item.groups || []).forEach((groupId) => {
      const group = findGroup(groupId);
      if (!group) return;
      mods[groupId] = group.defaultOption ? [group.defaultOption] : [];
    });
    return mods;
  }

  function findLine(lineId) {
    return state.lines.find((line) => line.lineId === lineId) || null;
  }


  /* --- Grouping people in a cart ---------------------------------- */

  /* The cart is the order in the sequence it was built. Nothing groups
     it, because nothing in the cart knows who a line is for. */
  function cartOrder() {
    return state.lines;
  }


  /* --- Render: menu ----------------------------------------------- */

  function renderMenu() {
    const tabs = $('menu-tabs');
    tabs.innerHTML = '';
    MENU.forEach((section) => {
      const tab = el('button', 'rail-tab' + (section.id === state.section ? ' rail-tab--active' : ''),
        escapeHtml(section.label));
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(section.id === state.section));
      tab.addEventListener('click', () => {
        state.section = section.id;
        renderMenu();
        const target = $('section-' + section.id);
        if (target) target.scrollIntoView({ block: 'start' });
      });
      tabs.appendChild(tab);
    });

    const host = $('menu-sections');
    host.innerHTML = '';
    MENU.forEach((section) => {
      const wrap = el('div', 'legacy-section');
      wrap.id = 'section-' + section.id;
      wrap.appendChild(el('h2', 'type-heading legacy-section__title', escapeHtml(section.label)));
      if (section.note) {
        wrap.appendChild(el('p', 'type-caption legacy-section__note', escapeHtml(section.note)));
      }

      section.items.forEach((item) => {
        const card = el('div', 'rail-card' + (item.available ? '' : ' rail-card--disabled'));
        const button = el('button', 'legacy-menu__item');
        button.type = 'button';
        button.disabled = !item.available;

        const badge = item.available
          ? ''
          : ' <span class="rail-badge rail-badge--label rail-badge--error">Sold out today</span>';

        button.innerHTML =
          '<div class="rail-card__body">' +
            '<div class="legacy-menu__row">' +
              '<h3 class="rail-card__title">' + escapeHtml(item.name) + '</h3>' +
              '<span class="legacy-menu__price type-mono">' + money(item.price) + '</span>' +
            '</div>' +
            '<p class="rail-card__description">' + escapeHtml(item.description) + '</p>' +
            (badge ? '<div class="rail-card__meta">' + badge + '</div>' : '') +
          '</div>';

        if (item.available) {
          button.addEventListener('click', () => openSheet(item.id, null));
        }
        card.appendChild(button);
        wrap.appendChild(card);
      });

      host.appendChild(wrap);
    });

    $('menu-quote-badge').textContent = 'Ready in about ' + quotedMinutes() + ' min';
    $('menu-quote-detail').textContent = 'Estimated pickup ' + quotedClockTime();
    $('reorder-summary').textContent = 'Your ' + PREVIOUS_ORDER.placedOn + ' order';
  }


  /* --- Render: cart ------------------------------------------------ */

  function cartLineNode(line) {
    const item = findItem(line.itemId);
    const wrap = el('div', 'legacy-line');
    wrap.dataset.lineId = String(line.lineId);

    const mods = modSummary(line);
    const noteId = 'note-' + line.lineId;

    wrap.innerHTML =
      '<div class="rail-list-row">' +
        '<div class="rail-list-row__content">' +
          '<span class="rail-list-row__primary">' + escapeHtml(item.name) + '</span>' +
          (mods ? '<span class="rail-list-row__secondary">' + escapeHtml(mods) + '</span>' : '') +
        '</div>' +
        '<div class="rail-list-row__trailing">' +
          '<span class="legacy-line__price">' + money(lineTotal(line)) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="legacy-line__controls">' +
        '<div class="rail-stepper">' +
          '<button class="rail-stepper__button rail-stepper__button--decrement" type="button" aria-label="Decrease quantity of ' + escapeHtml(item.name) + '">&minus;</button>' +
          '<span class="rail-stepper__value" aria-live="polite">' + line.qty + '</span>' +
          '<button class="rail-stepper__button rail-stepper__button--increment" type="button" aria-label="Increase quantity of ' + escapeHtml(item.name) + '">+</button>' +
        '</div>' +
        '<div class="inline inline--sm">' +
          '<button class="rail-button rail-button--tertiary" type="button" data-act="remove">Remove</button>' +
        '</div>' +
      '</div>' +
      '<div class="legacy-line__note">' +
        '<div class="rail-input">' +
          '<label class="rail-input__label visually-hidden" for="' + noteId + '">Special instructions for ' + escapeHtml(item.name) + '</label>' +
          '<input class="rail-input__field" id="' + noteId + '" type="text" maxlength="' + INSTRUCTIONS_LIMIT + '" ' +
            'placeholder="Special instructions" ' +
            'value="' + escapeHtml(line.instructions) + '">' +
        '</div>' +
      '</div>';

    const dec = wrap.querySelector('.rail-stepper__button--decrement');
    const inc = wrap.querySelector('.rail-stepper__button--increment');
    if (line.qty <= 1) dec.disabled = true;

    dec.addEventListener('click', () => {
      if (line.qty > 1) { line.qty -= 1; renderCart(); }
    });
    inc.addEventListener('click', () => { line.qty += 1; renderCart(); });

    wrap.querySelector('[data-act="remove"]').addEventListener('click', () => askRemove(line.lineId));

    const note = wrap.querySelector('.rail-input__field');
    note.addEventListener('input', () => {
      line.instructions = note.value;
    });

    return wrap;
  }

  function renderCart() {
    const host = $('cart-lines');
    host.innerHTML = '';

    const count = itemCount();
    $('cart-count').textContent = count === 1 ? '1 item' : count + ' items';
    $('cart-empty').hidden = state.lines.length > 0;

    cartOrder().forEach((line) => host.appendChild(cartLineNode(line)));

    /* The law wants the total including mandatory fees on the first price
       screen, and it is here. The breakdown lives on the payment screen. */
    renderTotals($('cart-totals'), { full: false, includeTip: false });
    renderActionBar();
  }


  /* --- Render: totals ----------------------------------------------- */

  function renderTotals(host, opts) {
    if (!host) return;
    host.innerHTML = '';

    const row = (label, value, cls) => {
      const node = el('div', 'legacy-totals__row' + (cls ? ' ' + cls : ''));
      node.innerHTML =
        '<span class="type-body legacy-totals__label">' + label + '</span>' +
        '<span class="legacy-totals__value">' + value + '</span>';
      host.appendChild(node);
    };

    if (opts.full) {
      row('Subtotal', money(subtotal()));
      if (discount() > 0) row('Promo ' + escapeHtml(state.promoApplied.code), '&minus;' + money(discount()));
      row('Service fee (' + Math.round(RESTAURANT.serviceFeeRate * 100) + '%)', money(serviceFee()));
      row('Sales tax', money(tax()));
      if (opts.includeTip) row('Tip', money(tipAmount()));
    }

    const total = opts.includeTip ? grandTotal() : preTipTotal();
    row('Total', money(total), 'legacy-totals__row--grand');

    if (!opts.full) {
      host.appendChild(el('span', 'type-caption legacy-muted',
        opts.includeTip ? 'Includes fees, tax and tip.' : 'Includes fees and tax.'));
    }
  }


  /* --- Render: time -------------------------------------------------- */

  function pickupSlots() {
    const slots = [{ id: 'asap', label: 'As soon as possible (' + quotedMinutes() + ' min)' }];
    const base = new Date(Date.now() + quotedMinutes() * 60000);
    base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15, 0, 0);
    for (let i = 0; i < 8; i++) {
      const at = new Date(base.getTime() + i * 15 * 60000);
      slots.push({
        id: 'slot-' + i,
        label: at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      });
    }
    return slots;
  }

  function renderTime() {
    const list = $('time-options');
    const slots = pickupSlots();
    list.innerHTML = '';

    slots.forEach((slot) => {
      const option = el('li', 'rail-select__option' +
        (slot.id === state.pickupSlot ? ' rail-select__option--selected' : ''), escapeHtml(slot.label));
      option.setAttribute('role', 'option');
      option.setAttribute('tabindex', '-1');
      option.setAttribute('aria-selected', String(slot.id === state.pickupSlot));
      option.dataset.slot = slot.id;
      option.addEventListener('click', () => selectSlot(slot.id));
      list.appendChild(option);
    });

    const current = slots.find((s) => s.id === state.pickupSlot) || slots[0];
    $('time-select-value').textContent = current.label;

    $('time-quote-badge').textContent = 'Ready in about ' + quotedMinutes() + ' min';
    $('time-quote-detail').textContent = "Based on this restaurant's usual prep time";

    /* The slot is held against the payment method, so the picker stays
       locked until one is on file. */
    const unlocked = state.paymentMethod !== null;
    $('time-select-wrap').classList.toggle('rail-select--disabled', !unlocked);
    $('time-select').disabled = !unlocked;
    $('time-helper').textContent = unlocked
      ? 'Pick up inside or at the window on Alum Rock.'
      : 'Choose a payment method to set a pickup time.';
    if (!unlocked) closeSelect();
  }

  function selectSlot(slotId) {
    state.pickupSlot = slotId;
    closeSelect();
    renderTime();
    $('time-select').focus();
  }

  function openSelect() {
    $('time-select-wrap').classList.add('rail-select--open');
    $('time-select').setAttribute('aria-expanded', 'true');
    const selected = $('time-options').querySelector('.rail-select__option--selected') ||
      $('time-options').querySelector('.rail-select__option');
    if (selected) selected.focus();
  }

  function closeSelect() {
    $('time-select-wrap').classList.remove('rail-select--open');
    $('time-select').setAttribute('aria-expanded', 'false');
  }

  function isSelectOpen() {
    return $('time-select-wrap').classList.contains('rail-select--open');
  }


  /* --- Render: tip ---------------------------------------------------- */

  const TIP_CHOICES = [
    { id: '18', label: '18%', percent: 18 },
    { id: '20', label: '20%', percent: 20 },
    { id: '22', label: '22%', percent: 22 },
    { id: '25', label: '25%', percent: 25 },
    { id: 'custom', label: 'Custom', percent: null },
    { id: 'none', label: 'No tip', percent: 0 },
  ];

  function renderTip() {
    const grid = $('tip-grid');
    grid.innerHTML = '';

    TIP_CHOICES.forEach((choice) => {
      const isCustom = choice.id === 'custom';
      const checked = isCustom
        ? state.tipCustom !== null
        : state.tipCustom === null && state.tipPercent === choice.percent;

      const button = el('button', 'legacy-tip__option');
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(checked));

      const amount = isCustom
        ? (state.tipCustom !== null ? money(state.tipCustom) : 'Enter')
        : money(tipBase() * (choice.percent / 100));

      button.innerHTML =
        '<span class="legacy-tip__pct">' + escapeHtml(choice.label) + '</span>' +
        '<span class="legacy-tip__amt">' + amount + '</span>';

      button.addEventListener('click', () => {
        if (isCustom) {
          state.tipCustom = state.tipCustom === null ? 0 : state.tipCustom;
          $('tip-custom-wrap').hidden = false;
          $('tip-custom').focus();
        } else {
          state.tipCustom = null;
          state.tipPercent = choice.percent;
          $('tip-custom-wrap').hidden = true;
        }
        renderTip();
      });

      grid.appendChild(button);
    });

    renderTotals($('tip-totals'), { full: false, includeTip: true });
    renderActionBar();
  }


  /* --- Render: pay ------------------------------------------------------ */

  function renderPay() {
    const list = $('pay-list');
    list.innerHTML = '';

    PAYMENT_METHODS.forEach((method) => {
      const checked = state.paymentMethod === method.id;
      const button = el('button', 'legacy-pay__option');
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(checked));
      button.innerHTML =
        '<span class="legacy-pay__mark" aria-hidden="true">' + method.mark + '</span>' +
        '<span class="legacy-pay__text">' + escapeHtml(method.label) +
        (method.detail ? ' <span class="type-caption legacy-muted">· ' + escapeHtml(method.detail) + '</span>' : '') +
        '</span>' +
        (checked ? '<span class="rail-badge rail-badge--label rail-badge--brand">Selected</span>' : '');
      button.addEventListener('click', () => {
        state.paymentMethod = method.id;
        renderPay();
        renderActionBar();
      });
      list.appendChild(button);
    });

    renderTotals($('pay-totals'), { full: true, includeTip: true });
    $('pay-utensils').checked = state.utensils;
  }


  /* --- Render: confirmation ---------------------------------------------- */

  function renderConfirm() {
    $('confirm-number').textContent = state.orderNumber || '—';
    $('confirm-detail').innerHTML = '';
  }


  /* --- Action bar ---------------------------------------------------------- */

  function renderActionBar() {
    const meta = SCREEN_META[state.screen];
    const bar = $('actionbar');
    const summary = $('actionbar-summary');
    const action = $('primary-action');

    if (!meta.cta) { bar.hidden = true; return; }
    bar.hidden = false;
    action.textContent = meta.cta;

    let label = '';
    let value = '';
    if (state.screen === 'menu') {
      label = itemCount() === 1 ? '1 item' : itemCount() + ' items';
      value = money(preTipTotal());
    } else if (state.screen === 'cart' || state.screen === 'time') {
      label = 'Total';
      value = money(preTipTotal());
    } else if (state.screen === 'tip' || state.screen === 'pay') {
      label = 'Total';
      value = money(grandTotal());
    }

    summary.innerHTML = label
      ? '<span class="type-body legacy-actionbar__label">' + label + '</span>' +
        '<span class="legacy-actionbar__value">' + value + '</span>'
      : '';

    action.disabled = false;
    if (state.screen === 'menu' && state.lines.length === 0) action.disabled = true;
    if (state.screen === 'cart' && state.lines.length === 0) action.disabled = true;
    if (state.screen === 'pay' && !state.paymentMethod) action.disabled = true;
  }


  /* --- Navigation ------------------------------------------------------------ */

  function go(screen) {
    state.screen = screen;
    SCREENS.forEach((name) => {
      $('screen-' + name).hidden = name !== screen;
    });

    const meta = SCREEN_META[screen];
    $('topbar-title').textContent = meta.title;
    $('topbar-eyebrow').textContent = meta.eyebrow;
    $('topbar-step').textContent = meta.step || '';
    $('topbar-step').hidden = !meta.step;
    $('nav-back').hidden = screen === 'menu' || screen === 'confirm';

    if (screen === 'menu') renderMenu();
    if (screen === 'cart') renderCart();
    if (screen === 'time') renderTime();
    if (screen === 'tip') renderTip();
    if (screen === 'pay') renderPay();
    if (screen === 'confirm') renderConfirm();

    renderActionBar();
    window.scrollTo(0, 0);

    const heading = $('screen-' + screen).querySelector('.legacy-screen__heading');
    if (heading) heading.focus();
  }

  function nextScreen() {
    const index = SCREENS.indexOf(state.screen);
    if (state.screen === 'pay') { placeOrder(); return; }
    if (index < SCREENS.length - 1) go(SCREENS[index + 1]);
  }

  function previousScreen() {
    const index = SCREENS.indexOf(state.screen);
    if (index > 0) go(SCREENS[index - 1]);
  }


  /* --- Place order -------------------------------------------------------------- */

  function placeOrder() {
    state.orderNumber = 'A' + String(4400 + Math.floor(Math.random() * 90));
    state.confirmTotal = grandTotal();
    state.confirmPickup = state.pickupSlot === 'asap'
      ? 'About ' + quotedMinutes() + ' min (' + quotedClockTime() + ')'
      : (pickupSlots().find((s) => s.id === state.pickupSlot) || {}).label || '';
    state.confirmLines = state.lines.map((line) => {
      const item = findItem(line.itemId);
      const mods = modSummary(line);
      return line.qty + '× ' + item.name + (mods ? ' (' + mods + ')' : '') +
        (line.instructions ? ' — "' + line.instructions + '"' : '');
    });
    go('confirm');
  }


  /* --- Item sheet ------------------------------------------------------------------ */

  function openSheet(itemId, lineId) {
    const item = findItem(itemId);
    if (!item) return;

    const existing = lineId !== null ? findLine(lineId) : null;
    state.sheet = {
      itemId: itemId,
      lineId: lineId,
      qty: existing ? existing.qty : 1,
      mods: existing ? JSON.parse(JSON.stringify(existing.mods)) : defaultMods(item),
      instructions: existing ? existing.instructions : '',
    };

    $('sheet-title').textContent = item.name;
    $('sheet-add').textContent = existing ? 'Save changes' : 'Add to order';
    renderSheet();

    $('sheet-backdrop').hidden = false;
    $('item-sheet').showModal();
  }

  function renderSheet() {
    const sheet = state.sheet;
    const item = findItem(sheet.itemId);
    const body = $('sheet-body');
    body.innerHTML = '';

    body.appendChild(el('p', 'type-body legacy-sheet__desc', escapeHtml(item.description)));

    (item.groups || []).forEach((groupId) => {
      const group = findGroup(groupId);
      if (!group) return;

      const wrap = el('div', 'legacy-sheet__group');

      if (group.type === 'single') {
        /* Rail has no radio group. A Select is the closest thing it ships. */
        const selectId = 'sheet-select-' + groupId;
        const select = el('div', 'rail-select');
        const chosen = (sheet.mods[groupId] || [])[0] || group.defaultOption;
        const chosenLabel = (findOption(groupId, chosen) || { label: 'Choose' }).label;

        select.innerHTML =
          '<label class="rail-select__label" for="' + selectId + '">' + escapeHtml(group.label) + '</label>' +
          '<button class="rail-select__trigger" type="button" id="' + selectId + '" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="rail-select__value">' + escapeHtml(chosenLabel) + '</span>' +
            '<span class="rail-select__chevron" aria-hidden="true">&#9662;</span>' +
          '</button>' +
          '<ul class="rail-select__dropdown" role="listbox" aria-labelledby="' + selectId + '"></ul>';

        const list = select.querySelector('.rail-select__dropdown');
        group.options.forEach((option) => {
          const li = el('li', 'rail-select__option' + (option.id === chosen ? ' rail-select__option--selected' : ''),
            escapeHtml(option.label) + (option.price ? ' (+' + money(option.price) + ')' : ''));
          li.setAttribute('role', 'option');
          li.setAttribute('tabindex', '-1');
          li.setAttribute('aria-selected', String(option.id === chosen));
          li.addEventListener('click', () => {
            sheet.mods[groupId] = [option.id];
            renderSheet();
          });
          list.appendChild(li);
        });

        select.querySelector('.rail-select__trigger').addEventListener('click', () => {
          const open = select.classList.toggle('rail-select--open');
          select.querySelector('.rail-select__trigger').setAttribute('aria-expanded', String(open));
          if (open) {
            const first = list.querySelector('.rail-select__option--selected') ||
              list.querySelector('.rail-select__option');
            if (first) first.focus();
          }
        });

        list.addEventListener('keydown', (event) => {
          const options = Array.from(list.querySelectorAll('.rail-select__option'));
          const index = options.indexOf(document.activeElement);
          if (event.key === 'ArrowDown') { event.preventDefault(); (options[index + 1] || options[0]).focus(); }
          if (event.key === 'ArrowUp') { event.preventDefault(); (options[index - 1] || options[options.length - 1]).focus(); }
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.activeElement.click(); }
          if (event.key === 'Escape') {
            event.preventDefault();
            select.classList.remove('rail-select--open');
            select.querySelector('.rail-select__trigger').focus();
          }
        });

        wrap.appendChild(select);
      } else {
        const fieldset = el('fieldset', 'rail-checkbox-group legacy-sheet__checks');
        fieldset.appendChild(el('legend', 'rail-checkbox-group__legend', escapeHtml(group.label)));
        group.options.forEach((option) => {
          const checked = (sheet.mods[groupId] || []).indexOf(option.id) !== -1;
          const label = el('label', 'rail-checkbox');
          label.innerHTML =
            '<input class="rail-checkbox__input" type="checkbox"' + (checked ? ' checked' : '') + '>' +
            '<span class="rail-checkbox__box" aria-hidden="true"></span>' +
            '<span class="rail-checkbox__label">' + escapeHtml(option.label) +
              (option.price ? ' (+' + money(option.price) + ')' : '') + '</span>';
          label.querySelector('input').addEventListener('change', (event) => {
            const list = sheet.mods[groupId] || (sheet.mods[groupId] = []);
            const at = list.indexOf(option.id);
            if (event.target.checked && at === -1) list.push(option.id);
            if (!event.target.checked && at !== -1) list.splice(at, 1);
            updateSheetPrice();
          });
          fieldset.appendChild(label);
        });
        wrap.appendChild(fieldset);
      }

      body.appendChild(wrap);
    });

    /* Special instructions */
    const notes = el('div', 'legacy-sheet__group');
    notes.innerHTML =
      '<div class="rail-input">' +
        '<label class="rail-input__label" for="sheet-notes">Special instructions</label>' +
        '<textarea class="rail-input__field rail-input__field--textarea" id="sheet-notes" rows="2" ' +
          'maxlength="' + INSTRUCTIONS_LIMIT + '" ' +
          'placeholder="Allergies, names, anything the kitchen needs">' + escapeHtml(sheet.instructions) + '</textarea>' +
      '</div>';
    const notesField = notes.querySelector('#sheet-notes');
    notesField.addEventListener('input', () => {
      sheet.instructions = notesField.value;
    });
    body.appendChild(notes);

    /* Quantity */
    const qty = el('div', 'legacy-sheet__qty');
    qty.innerHTML =
      '<span class="type-label">Quantity</span>' +
      '<div class="rail-stepper">' +
        '<button class="rail-stepper__button rail-stepper__button--decrement" type="button" aria-label="Decrease quantity"' +
          (sheet.qty <= 1 ? ' disabled' : '') + '>&minus;</button>' +
        '<span class="rail-stepper__value" aria-live="polite">' + sheet.qty + '</span>' +
        '<button class="rail-stepper__button rail-stepper__button--increment" type="button" aria-label="Increase quantity">+</button>' +
      '</div>';
    qty.querySelector('.rail-stepper__button--decrement').addEventListener('click', () => {
      if (sheet.qty > 1) { sheet.qty -= 1; renderSheet(); }
    });
    qty.querySelector('.rail-stepper__button--increment').addEventListener('click', () => {
      sheet.qty += 1; renderSheet();
    });
    body.appendChild(qty);

    updateSheetPrice();
  }

  function updateSheetPrice() {
    const sheet = state.sheet;
    if (!sheet) return;
    const price = lineUnitPrice({ itemId: sheet.itemId, mods: sheet.mods, qty: 1 }) * sheet.qty;
    const verb = sheet.lineId !== null ? 'Save changes' : 'Add to order';
    $('sheet-add').textContent = verb + ' · ' + money(price);
  }

  function closeSheet() {
    $('item-sheet').close();
    $('sheet-backdrop').hidden = true;
    state.sheet = null;
  }

  function commitSheet() {
    const sheet = state.sheet;
    if (!sheet) return;
    if (sheet.lineId !== null) {
      const line = findLine(sheet.lineId);
      if (line) {
        line.qty = sheet.qty;
        line.mods = sheet.mods;
        line.instructions = sheet.instructions;
      }
    } else {
      addLine(sheet.itemId, sheet.qty, sheet.mods, sheet.instructions);
      toast(findItem(sheet.itemId).name + ' added to your order.', 'success');
    }
    closeSheet();
    if (state.screen === 'cart') renderCart();
    renderActionBar();
    renderMenu();
  }


  /* --- Remove confirmation ------------------------------------------------------------- */

  function askRemove(lineId) {
    const line = findLine(lineId);
    if (!line) return;
    state.pendingRemoval = lineId;
    $('confirm-dialog-body').textContent =
      findItem(line.itemId).name + ' will come out of your order.';
    $('confirm-backdrop').hidden = false;
    $('confirm-dialog').showModal();
  }

  function closeRemove() {
    $('confirm-dialog').close();
    $('confirm-backdrop').hidden = true;
    state.pendingRemoval = null;
  }

  function doRemove() {
    const lineId = state.pendingRemoval;
    closeRemove();
    if (lineId === null) return;

    const at = state.lines.findIndex((line) => line.lineId === lineId);
    if (at === -1) return;
    state.lines.splice(at, 1);

    /* Rebuild the cart from state and go back to the top of it. */
    renderCart();
    window.scrollTo(0, 0);
  }


  /* --- Order again ------------------------------------------------------------------------ */

  function orderAgain() {
    PREVIOUS_ORDER.lines.forEach((previous) => {
      const item = findItem(previous.itemId);
      if (!item || !item.available) return;
      addLine(previous.itemId, previous.qty, JSON.parse(JSON.stringify(previous.mods)), previous.instructions);
    });

    renderMenu();
    renderActionBar();
    go('cart');
  }


  /* --- Promo code --------------------------------------------------------------------------- */

  function applyPromo() {
    const code = $('promo-code').value.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) return;
    state.promoApplied = promo;
    renderCart();
  }


  /* --- Demo states ------------------------------------------------------------------------------ */

  function loadDemo() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('demo') === 'group') {
      GROUP_DEMO_LINES.forEach((line) => {
        addLine(line.itemId, line.qty, JSON.parse(JSON.stringify(line.mods)), line.instructions);
      });
      state.screen = 'cart';
    }

    const screen = params.get('screen');
    if (screen && SCREENS.indexOf(screen) !== -1) {
      if (state.lines.length === 0) {
        GROUP_DEMO_LINES.slice(0, 3).forEach((line) => {
          addLine(line.itemId, line.qty, JSON.parse(JSON.stringify(line.mods)), line.instructions);
        });
      }
      if (screen === 'pay' || screen === 'confirm') state.paymentMethod = 'saved';
      state.screen = screen;
    }
  }


  /* --- Wiring ------------------------------------------------------------------------------------ */

  function init() {
    loadDemo();

    $('primary-action').addEventListener('click', nextScreen);
    $('nav-back').addEventListener('click', previousScreen);
    $('order-again').addEventListener('click', orderAgain);
    $('promo-apply').addEventListener('click', applyPromo);
    $('promo-code').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); applyPromo(); }
    });

    $('sheet-close').addEventListener('click', closeSheet);
    $('sheet-cancel').addEventListener('click', closeSheet);
    $('sheet-add').addEventListener('click', commitSheet);
    $('item-sheet').addEventListener('close', () => { $('sheet-backdrop').hidden = true; });

    $('confirm-cancel').addEventListener('click', closeRemove);
    $('confirm-ok').addEventListener('click', doRemove);
    $('confirm-dialog').addEventListener('close', () => { $('confirm-backdrop').hidden = true; });

    $('time-select').addEventListener('click', () => {
      if (isSelectOpen()) closeSelect(); else openSelect();
    });
    $('time-options').addEventListener('keydown', (event) => {
      const options = Array.from($('time-options').querySelectorAll('.rail-select__option'));
      const index = options.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') { event.preventDefault(); (options[index + 1] || options[0]).focus(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); (options[index - 1] || options[options.length - 1]).focus(); }
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.activeElement.click(); }
      if (event.key === 'Escape') { event.preventDefault(); closeSelect(); $('time-select').focus(); }
    });
    document.addEventListener('click', (event) => {
      if (isSelectOpen() && !$('time-select-wrap').contains(event.target)) closeSelect();
    });

    $('pickup-phone').addEventListener('input', (event) => { state.phone = event.target.value; });
    $('tip-custom').addEventListener('input', (event) => {
      const value = parseFloat(event.target.value);
      state.tipCustom = isNaN(value) ? 0 : value;
      renderTip();
    });
    $('pay-utensils').addEventListener('change', (event) => { state.utensils = event.target.checked; });

    $('start-over').addEventListener('click', () => {
      state.lines = [];
      state.promoApplied = null;
      state.tipPercent = null;
      state.tipCustom = null;
      state.paymentMethod = null;
      state.orderNumber = null;
      go('menu');
    });

    go(state.screen);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
