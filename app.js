(() => {
  "use strict";

  const STORAGE_KEY = "calendarEvents";
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const MAX_VISIBLE_EVENTS = 3;
  const CHIP_COLOR_COUNT = 6;

  function chipColorClass(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) % CHIP_COLOR_COUNT;
    }
    return `chip-${hash}`;
  }

  const els = {
    monthLabel: document.getElementById("month-label"),
    prevBtn: document.getElementById("prev-month"),
    nextBtn: document.getElementById("next-month"),
    todayBtn: document.getElementById("today-btn"),
    addEventBtn: document.getElementById("add-event-btn"),
    weekdayHeader: document.getElementById("weekday-header"),
    grid: document.getElementById("calendar-grid"),
    overlay: document.getElementById("modal-overlay"),
    modal: document.getElementById("event-modal"),
    modalTitle: document.getElementById("modal-title"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    form: document.getElementById("event-form"),
    titleInput: document.getElementById("event-title"),
    titleError: document.getElementById("title-error"),
    dateInput: document.getElementById("event-date"),
    dateError: document.getElementById("date-error"),
    timeInput: document.getElementById("event-time"),
    timeError: document.getElementById("time-error"),
    descriptionInput: document.getElementById("event-description"),
    deleteBtn: document.getElementById("delete-event-btn"),
    cancelBtn: document.getElementById("cancel-btn"),
  };

  const today = new Date();
  const state = {
    events: [],
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    editingId: null,
    modalTrigger: null,
  };

  // ---------- Storage ----------

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  }

  // ---------- Date helpers ----------

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toDateKey(year, month, day) {
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
  }

  function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  function isValidTimeString(value) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  // ---------- Rendering ----------

  function renderWeekdayHeader() {
    els.weekdayHeader.innerHTML = "";
    WEEKDAYS.forEach((day) => {
      const div = document.createElement("div");
      div.textContent = day;
      els.weekdayHeader.appendChild(div);
    });
  }

  function renderMonth() {
    const { viewYear, viewMonth } = state;
    els.monthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    els.grid.innerHTML = "";

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const eventsByDate = new Map();
    for (const ev of state.events) {
      if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, []);
      eventsByDate.get(ev.date).push(ev);
    }
    for (const list of eventsByDate.values()) {
      list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }

    for (let i = 0; i < firstWeekday; i++) {
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      empty.setAttribute("aria-hidden", "true");
      els.grid.appendChild(empty);
    }

    const isRealTodayMonth =
      viewYear === today.getFullYear() && viewMonth === today.getMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKey(viewYear, viewMonth, day);
      const isToday = isRealTodayMonth && day === today.getDate();

      const cell = document.createElement("div");
      cell.className = "day-cell";

      const dayNumber = document.createElement("button");
      dayNumber.type = "button";
      dayNumber.className = "day-number";
      dayNumber.setAttribute(
        "aria-label",
        `${isToday ? "Today, " : ""}${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}. Add event.`
      );
      if (isToday) {
        const badge = document.createElement("span");
        badge.className = "today-badge";
        badge.textContent = String(day);
        dayNumber.appendChild(badge);
      } else {
        dayNumber.textContent = String(day);
      }
      dayNumber.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal({ mode: "create", date: dateKey, trigger: dayNumber });
      });
      cell.appendChild(dayNumber);

      const list = document.createElement("div");
      list.className = "event-list";
      const dayEvents = eventsByDate.get(dateKey) || [];
      const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
      for (const ev of visibleEvents) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `event-chip ${chipColorClass(ev.id)}`;
        chip.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
        chip.setAttribute("aria-label", `Edit event: ${ev.title}${ev.time ? `, ${ev.time}` : ""}`);
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal({ mode: "edit", event: ev, trigger: chip });
        });
        list.appendChild(chip);
      }
      const hiddenCount = dayEvents.length - visibleEvents.length;
      if (hiddenCount > 0) {
        const more = document.createElement("div");
        more.className = "event-more";
        more.textContent = `+${hiddenCount} more`;
        list.appendChild(more);
      }
      cell.appendChild(list);

      cell.addEventListener("click", () => {
        openModal({ mode: "create", date: dateKey, trigger: dayNumber });
      });

      els.grid.appendChild(cell);
    }
  }

  // ---------- Modal ----------

  function clearErrors() {
    els.titleError.textContent = "";
    els.dateError.textContent = "";
    els.timeError.textContent = "";
    for (const input of [els.titleInput, els.dateInput, els.timeInput]) {
      input.closest(".field").classList.remove("has-error");
      input.setAttribute("aria-invalid", "false");
    }
  }

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'button:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled])'
      )
    );
  }

  function trapModalTab(e) {
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(els.modal);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal({ mode, date = "", event = null, trigger = null }) {
    clearErrors();
    state.editingId = mode === "edit" ? event.id : null;
    state.modalTrigger = trigger || document.activeElement;
    els.modalTitle.textContent = mode === "edit" ? "Edit Event" : "Add Event";
    els.deleteBtn.hidden = mode !== "edit";

    if (mode === "edit") {
      els.titleInput.value = event.title;
      els.dateInput.value = event.date;
      els.timeInput.value = event.time || "";
      els.descriptionInput.value = event.description || "";
    } else {
      els.form.reset();
      els.dateInput.value = date;
    }

    els.overlay.hidden = false;
    els.titleInput.focus();
  }

  function closeModal() {
    els.overlay.hidden = true;
    state.editingId = null;
    els.form.reset();
    clearErrors();
    if (state.modalTrigger && document.body.contains(state.modalTrigger)) {
      state.modalTrigger.focus();
    } else {
      els.addEventBtn.focus();
    }
    state.modalTrigger = null;
  }

  function validateForm() {
    clearErrors();
    let valid = true;
    let firstInvalid = null;

    const title = els.titleInput.value.trim();
    if (!title) {
      els.titleError.textContent = "Title is required.";
      els.titleInput.closest(".field").classList.add("has-error");
      els.titleInput.setAttribute("aria-invalid", "true");
      firstInvalid ||= els.titleInput;
      valid = false;
    }

    const date = els.dateInput.value;
    if (!date || !isValidDateString(date)) {
      els.dateError.textContent = "A valid date is required.";
      els.dateInput.closest(".field").classList.add("has-error");
      els.dateInput.setAttribute("aria-invalid", "true");
      firstInvalid ||= els.dateInput;
      valid = false;
    }

    const time = els.timeInput.value;
    if (time && !isValidTimeString(time)) {
      els.timeError.textContent = "Enter a valid time.";
      els.timeInput.closest(".field").classList.add("has-error");
      els.timeInput.setAttribute("aria-invalid", "true");
      firstInvalid ||= els.timeInput;
      valid = false;
    }

    if (firstInvalid) firstInvalid.focus();

    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const title = els.titleInput.value.trim();
    const date = els.dateInput.value;
    const time = els.timeInput.value;
    const description = els.descriptionInput.value.trim();

    if (state.editingId) {
      const ev = state.events.find((x) => x.id === state.editingId);
      if (ev) {
        ev.title = title;
        ev.date = date;
        ev.time = time;
        ev.description = description;
      }
    } else {
      state.events.push({
        id: crypto.randomUUID(),
        title,
        date,
        time,
        description,
      });
    }

    saveEvents();
    renderMonth();
    closeModal();
  }

  function handleDelete() {
    if (!state.editingId) return;
    state.events = state.events.filter((x) => x.id !== state.editingId);
    saveEvents();
    renderMonth();
    closeModal();
  }

  // ---------- Navigation ----------

  function changeMonth(delta) {
    let month = state.viewMonth + delta;
    let year = state.viewYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    state.viewMonth = month;
    state.viewYear = year;
    renderMonth();
  }

  function goToToday() {
    state.viewYear = today.getFullYear();
    state.viewMonth = today.getMonth();
    renderMonth();
  }

  // ---------- Init ----------

  function init() {
    state.events = loadEvents();
    renderWeekdayHeader();
    renderMonth();

    els.prevBtn.addEventListener("click", () => changeMonth(-1));
    els.nextBtn.addEventListener("click", () => changeMonth(1));
    els.todayBtn.addEventListener("click", goToToday);
    els.addEventBtn.addEventListener("click", () =>
      openModal({
        mode: "create",
        date: toDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
        trigger: els.addEventBtn,
      })
    );

    els.form.addEventListener("submit", handleSubmit);
    els.deleteBtn.addEventListener("click", handleDelete);
    els.cancelBtn.addEventListener("click", closeModal);
    els.closeModalBtn.addEventListener("click", closeModal);

    els.overlay.addEventListener("click", (e) => {
      if (e.target === els.overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (els.overlay.hidden) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "Tab") trapModalTab(e);
    });
  }

  init();
})();
