/* ============================================================
   Heard Line — expo rail

   Views: pass (default) · handheld · walk · terminal
   Service density, high-glare environment, Line surface.
   ============================================================ */

(function () {
  'use strict';

  const VIEWS = ['pass', 'handheld', 'walk', 'terminal'];

  const STATUS_LABEL = {
    incoming: 'Incoming',
    started: 'Started',
    ready: 'Ready',
    bumped: 'Bumped',
    recalled: 'Recalled',
  };

  /* Which Rail badge intent each status borrows. */
  const STATUS_INTENT = {
    incoming: '',
    started: ' rail-badge--info',
    ready: ' rail-badge--success',
    bumped: '',
    recalled: ' rail-badge--warning',
  };

  const ADVANCE = { incoming: 'started', started: 'ready' };


  /* --- State ---------------------------------------------------- */

  const state = {
    view: 'pass',
    tickets: JSON.parse(JSON.stringify(TICKETS)),
    eightySix: JSON.parse(JSON.stringify(EIGHTY_SIX)),
    tables: JSON.parse(JSON.stringify(TABLES)),
    startedAt: Date.now(),
    walks: 0,
    armedRecall: null,
    pending: null,
  };


  /* --- Helpers ---------------------------------------------------- */

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

  function elapsedMinutes(ticket) {
    return ticket.receivedMinutesAgo + (Date.now() - state.startedAt) / 60000;
  }

  function band(minutes) {
    if (minutes < SERVICE.bands.ok) return 'ok';
    if (minutes < SERVICE.bands.approaching) return 'approaching';
    if (minutes < SERVICE.bands.late) return 'late';
    return 'critical';
  }

  function clockString(minutes) {
    const whole = Math.floor(minutes);
    const seconds = Math.floor((minutes - whole) * 60);
    return whole + ':' + String(seconds).padStart(2, '0');
  }

  function toast(message, variant) {
    const node = el('div', 'rail-toast rail-toast--' + (variant || 'info'));
    node.setAttribute('role', 'alert');
    node.innerHTML =
      '<div class="rail-toast__icon" aria-hidden="true">&#9679;</div>' +
      '<div class="rail-toast__content"><span class="rail-toast__message">' +
      escapeHtml(message) + '</span></div>' +
      '<button class="rail-toast__dismiss" aria-label="Dismiss">&times;</button>';
    node.querySelector('.rail-toast__dismiss').addEventListener('click', () => node.remove());
    $('line-toasts').appendChild(node);
    setTimeout(() => {
      node.classList.add('rail-toast--exiting');
      setTimeout(() => node.remove(), 220);
    }, 4200);
  }

  /* Active tickets first, oldest on the left. Bumped tickets stay on the
     end of the rail so recall has something to reach. */
  function railOrder() {
    const live = state.tickets.filter((t) => t.status !== 'bumped');
    const gone = state.tickets.filter((t) => t.status === 'bumped');
    live.sort((a, b) => b.receivedMinutesAgo - a.receivedMinutesAgo);
    gone.sort((a, b) => b.receivedMinutesAgo - a.receivedMinutesAgo);
    return live.concat(gone);
  }


  /* --- Confirm dialog ------------------------------------------------ */

  function confirmAction(title, body, okLabel, onOk) {
    $('line-dialog-title').textContent = title;
    $('line-dialog-body').textContent = body;
    $('line-dialog-ok').textContent = okLabel;
    state.pending = onOk;
    $('line-backdrop').hidden = false;
    $('line-dialog').showModal();
  }

  function closeConfirm() {
    $('line-dialog').close();
    $('line-backdrop').hidden = true;
    state.pending = null;
  }


  /* --- Ticket rendering ------------------------------------------------ */

  function ticketNode(ticket) {
    const minutes = elapsedMinutes(ticket);
    const tier = band(minutes);

    const node = el('article', 'line-ticket line-ticket--' + ticket.status);
    node.setAttribute('role', 'listitem');
    node.dataset.ticketId = ticket.id;

    /* Head: number, source, status badge, elapsed time */
    const head = el('div', 'line-ticket__head');
    head.innerHTML =
      '<div class="line-ticket__ids">' +
        '<span class="line-ticket__number">#' + escapeHtml(ticket.number) + '</span>' +
        '<span class="line-ticket__source">' + escapeHtml(ticket.source) + '</span>' +
      '</div>' +
      '<div class="line-ticket__headright">' +
        '<span class="line-elapsed" data-elapsed="' + ticket.id + '">' +
          clockString(minutes) + '</span>' +
      '</div>';
    node.appendChild(head);

    /* Ticket state is current only. There is no history on a ticket. */
    node.appendChild(el('div', 'line-ticket__meta'));

    /* Body: items and their modifiers */
    const body = el('div', 'line-ticket__body');
    ticket.items.forEach((item) => {
      const row = el('div', 'line-item');
      let html =
        '<span class="line-item__name">' +
          '<span class="line-item__qty">' + item.qty + '&times;</span> ' +
          escapeHtml(item.name) +
        '</span>';
      if (item.mods && item.mods.length) {
        html += '<span class="line-item__mods">' +
          item.mods.map((m) => '<span class="line-item__mod">' + escapeHtml(m) + '</span>').join('') +
          '</span>';
      }
      row.innerHTML = html;
      body.appendChild(row);
    });
    node.appendChild(body);

    /* Actions */
    const actions = el('div', 'line-ticket__actions');

    /* Bump, recall and void, in that order, on every ticket. */
    const bump = el('button', 'rail-button rail-button--primary line-act', 'Bump');
    bump.type = 'button';
    bump.addEventListener('click', () => bumpTicket(ticket.id));
    actions.appendChild(bump);

    const armed = state.armedRecall === ticket.id;
    const recall = el('button', 'rail-button rail-button--primary line-act',
      armed ? 'Recall?' : 'Recall');
    recall.type = 'button';
    recall.addEventListener('click', () => recallTicket(ticket.id));
    actions.appendChild(recall);

    const voidBtn = el('button', 'rail-button rail-button--primary line-act', 'Void');
    voidBtn.type = 'button';
    voidBtn.addEventListener('click', () => voidTicket(ticket.id));
    actions.appendChild(voidBtn);

    node.appendChild(actions);

    /* Tapping the head walks the ticket forward through its states. */
    if (ADVANCE[ticket.status]) {
      head.style.cursor = 'pointer';
      head.setAttribute('tabindex', '0');
      head.setAttribute('role', 'button');
      head.setAttribute('aria-label', 'Mark ticket ' + ticket.number + ' ' + ADVANCE[ticket.status]);
      const advance = () => {
        ticket.status = ADVANCE[ticket.status];
        renderAll();
      };
      head.addEventListener('click', advance);
      head.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advance(); }
      });
    }

    return node;
  }

  function renderRail(host) {
    if (!host) return;
    host.innerHTML = '';
    railOrder().forEach((ticket) => host.appendChild(ticketNode(ticket)));
  }


  /* --- Actions ------------------------------------------------------------ */

  function findTicket(id) {
    return state.tickets.find((t) => t.id === id) || null;
  }

  function bumpTicket(id) {
    const ticket = findTicket(id);
    if (!ticket) return;
    ticket.status = 'bumped';
    renderAll();
    toast('Ticket #' + ticket.number + ' bumped. Recall is on the ticket.', 'success');
  }

  /* Recall arms on the first tap, opens a confirm on the second. */
  function recallTicket(id) {
    const ticket = findTicket(id);
    if (!ticket) return;

    if (state.armedRecall !== id) {
      state.armedRecall = id;
      renderAll();
      return;
    }

    state.armedRecall = null;
    renderAll();
    confirmAction(
      'Recall ticket #' + ticket.number + '?',
      ticket.source + ' · ' + ticket.items.length + ' items. This puts it back on the rail.',
      'Recall the ticket',
      () => {
        ticket.status = 'recalled';
        ticket.recallCount += 1;
        renderAll();
      }
    );
  }

  /* Void goes through on the tap. */
  function voidTicket(id) {
    const ticket = findTicket(id);
    if (!ticket) return;
    state.tickets = state.tickets.filter((t) => t.id !== id);
    renderAll();
  }

  function clearAll() {
    const live = state.tickets.filter((t) => t.status !== 'bumped');
    confirmAction(
      'Clear the rail?',
      'This bumps all ' + live.length + ' tickets still working. They stay recallable.',
      'Clear the rail',
      () => {
        state.tickets.forEach((t) => { t.status = 'bumped'; });
        renderAll();
        toast('Rail cleared. ' + live.length + ' tickets bumped.', 'info');
      }
    );
  }


  /* --- 86 board --------------------------------------------------------------- */

  function renderEightySix() {
    const host = $('eightysix-board');
    host.innerHTML = '';

    state.eightySix.filter((item) => item.off).forEach((item) => {
      const node = el('div', 'line-eightysix__item');
      node.innerHTML =
        '<span class="rail-badge rail-badge--label rail-badge--error">86</span>' +
        '<span class="line-eightysix__name">' + escapeHtml(item.name) + '</span>';
      host.appendChild(node);
    });
  }


  /* --- All day ------------------------------------------------------------------ */

  function renderAllDay() {
    const counts = {};
    state.tickets
      .filter((t) => t.status !== 'bumped')
      .forEach((ticket) => {
        ticket.items.forEach((item) => {
          counts[item.name] = (counts[item.name] || 0) + item.qty;
        });
      });

    const host = $('allday-grid');
    host.innerHTML = '';
    Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .forEach((name) => {
        const cell = el('div', 'line-allday__cell');
        cell.innerHTML =
          '<span class="line-allday__count">' + counts[name] + '</span>' +
          '<span class="line-allday__name">' + escapeHtml(name) + '</span>';
        host.appendChild(cell);
      });
  }


  /* --- Tables ---------------------------------------------------------------------- */

  const COURSE_INTENT = { fired: ' rail-badge--success', held: '' };

  function tableNode(table, canFire) {
    const node = el('div', 'line-table');
    node.setAttribute('role', 'listitem');

    const head = el('div', 'line-table__head');
    head.innerHTML =
      '<span class="line-table__label">' + escapeHtml(table.label) + '</span>' +
      '<span class="line-table__meta">Section ' + escapeHtml(table.section) +
      ' · ' + table.covers + ' covers · ' + escapeHtml(table.server) + '</span>';
    node.appendChild(head);

    table.courses.forEach((course, index) => {
      const row = el('div', 'line-course');
      row.innerHTML =
        '<span class="line-course__name">' + escapeHtml(course.name) + '</span>' +
        '<span class="rail-badge rail-badge--label' + COURSE_INTENT[course.state] + '">' +
          (course.state === 'fired' ? 'Fired' : 'Held') + '</span>';

      if (canFire && course.state === 'held') {
        const fire = el('button', 'rail-button rail-button--primary', 'Fire');
        fire.type = 'button';
        fire.addEventListener('click', () => {
          confirmAction(
            'Fire ' + course.name + ' for ' + table.label + '?',
            table.covers + ' covers. The kitchen starts it now.',
            'Fire the course',
            () => {
              table.courses[index].state = 'fired';
              renderAll();
              toast(course.name + ' fired for ' + table.label + '.', 'success');
            }
          );
        });
        row.appendChild(fire);
      }

      node.appendChild(row);
    });

    return node;
  }

  function renderTables() {
    /* The handheld reads table status. Firing lives on the terminal. */
    const handheld = $('handheld-tables');
    handheld.innerHTML = '';
    state.tables.forEach((table) => handheld.appendChild(tableNode(table, false)));

    const terminal = $('terminal-tables');
    terminal.innerHTML = '';
    state.tables.forEach((table) => terminal.appendChild(tableNode(table, true)));
  }


  /* --- Clock ------------------------------------------------------------------------- */

  function tick() {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    $('pass-clock').textContent = now;
    $('terminal-clock').textContent = now;

    state.tickets.forEach((ticket) => {
      const minutes = elapsedMinutes(ticket);
      document.querySelectorAll('[data-elapsed="' + ticket.id + '"]').forEach((node) => {
        node.textContent = clockString(minutes);
      });
    });
  }


  /* --- Views ------------------------------------------------------------------------- */

  /* The rail fills the rest of the pass display, whatever is above it. */
  function sizeRail() {
    const rail = $('rail');
    if (!rail || $('view-pass').hidden) return;
    rail.style.height = 'auto';
    const top = rail.getBoundingClientRect().top + window.scrollY;
    rail.style.height = Math.max(240, window.innerHeight - top) + 'px';
  }

  function renderAll() {
    renderRail($('rail'));
    renderRail($('handheld-rail'));
    renderEightySix();
    renderAllDay();
    renderTables();
    sizeRail();
  }

  function go(view) {
    state.view = view;
    VIEWS.forEach((name) => { $('view-' + name).hidden = name !== view; });
    window.scrollTo(0, 0);
    if (view === 'pass') sizeRail();
    if (view === 'walk') {
      $('walk-count').textContent = 'Trips this shift: ' + state.walks;
      $('walk-heading').focus();
    }
  }


  /* --- Wiring -------------------------------------------------------------------------- */

  function init() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && VIEWS.indexOf(view) !== -1) state.view = view;

    $('clear-all').addEventListener('click', clearAll);
    $('to-handheld').addEventListener('click', () => go('handheld'));
    $('to-pass').addEventListener('click', () => go('pass'));

    $('start-walk').addEventListener('click', () => { state.walks += 1; go('walk'); });
    $('arrive-terminal').addEventListener('click', () => go('terminal'));
    $('abandon-walk').addEventListener('click', () => go('handheld'));
    $('leave-terminal').addEventListener('click', () => go('handheld'));

    $('line-dialog-cancel').addEventListener('click', closeConfirm);
    $('line-dialog-ok').addEventListener('click', () => {
      const run = state.pending;
      closeConfirm();
      if (run) run();
    });
    $('line-dialog').addEventListener('close', () => { $('line-backdrop').hidden = true; });

    window.addEventListener('resize', sizeRail);

    renderAll();
    go(state.view);
    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
