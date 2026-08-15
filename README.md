# Calendar App

A simple month-view calendar you can use to keep track of events. Add, edit, and delete events on any day, and your events are saved automatically so they're still there next time you open the app.

This app is "static," which means it's just HTML, CSS, and JavaScript files. There's nothing to install and no server to set up.

## Setup

1. Find the project folder on your computer.
2. Double-click `index.html`.
3. It will open in your default web browser, and the calendar will be ready to use.

That's it — no installation, no build step, no internet connection required.

**Optional: running a local server.** Some browsers handle saved data (called `localStorage`) a little differently when a page is opened directly from a file versus served over `http://`. If you notice your events aren't saving between visits, you can try running a simple local server instead of opening the file directly. For example, if you have Python installed, open a terminal in the project folder and run:

```
python3 -m http.server
```

Then visit `http://localhost:8000` in your browser. This step is optional — most people won't need it.

## Features

- **Month navigation.** Use the `‹` and `›` buttons to move to the previous or next month, and the "Today" button to jump back to the current month.
- **Add an event.** Click the "+ Add Event" button, or click directly on a day in the calendar, to open a form where you can enter an event.
- **Edit an event.** Click an existing event (shown as a colored chip on its day) to open it in the same form, with its details already filled in.
- **Delete an event.** Open an existing event and click the "Delete" button.
- **Event details.** Each event has a title (required), a date (required), an optional time, and an optional description.
- **Input validation.** If you try to save an event without a title, without a valid date, or with an improperly formatted time, the app shows an inline error message next to the problem field and won't save until it's fixed.
- **Automatic saving.** Every time you add, edit, or delete an event, it's saved right away in your browser's local storage. Your events will still be there the next time you open the app in the same browser, even after closing the tab or restarting your computer. (Events are stored only on your own device — they aren't sent anywhere.)
- **Today highlight.** The current day is marked with a colored circle around its date number.
- **Overflow handling.** If a day has more than 3 events, the extra ones are summarized as "+N more" instead of cluttering the cell.
- **Light and dark mode.** The app automatically matches your operating system's light or dark appearance setting.
- **Responsive layout.** The calendar and the add/edit form resize to remain usable on narrower screens, like a phone.

## Accessibility

The app has been reviewed for accessibility and includes:

- **Full keyboard access.** Every day and every event is a real button you can reach with the Tab key and activate with Enter or Space — not just clickable with a mouse.
- **Descriptive labels for screen readers.** Day buttons announce things like "Today, August 15, 2026. Add event." and event chips announce "Edit event: [title]," so the purpose of each button is clear even without seeing the screen.
- **Focus trap in the popup form.** While the add/edit event window is open, pressing Tab cycles only through the fields and buttons inside that window, so keyboard focus doesn't slip behind it.
- **Focus returns after closing.** When you close the form (by saving, canceling, or pressing Escape), keyboard focus moves back to whatever you clicked to open it.
- **Escape to close.** Pressing the Escape key closes the add/edit event window.
- **Announced errors.** Validation error messages (like "Title is required.") are linked to their input field and use live regions, so screen readers announce them automatically.
- **Announced month changes.** The month/year heading is a live region, so screen readers announce it when you navigate to a different month.
- **Required-field indication.** The Title and Date fields are marked as required for assistive technology, not just visually.
- **Color contrast.** Event chip colors were checked and adjusted to meet WCAG AA contrast guidelines, and "today" is also conveyed through text ("Today, ...") rather than color alone.

See `tasks/todo.md` in this project for the full accessibility audit this summary is based on.

## Example Usage: Adding an Event

Here's how to add an event to a specific day, for example August 20, 2026:

1. Open `index.html` in your browser (see Setup above).
2. Use the `‹` and `›` buttons at the top until the calendar shows the month you want (in this example, August 2026).
3. Click on the box for August 20 in the calendar grid.
4. A window titled "Add Event" will appear, with the date already filled in.
5. Type a title, such as "Dentist appointment," into the Title field.
6. (Optional) Enter a time and a short description.
7. Click "Save."
8. The window closes, and you'll see your event listed as a small colored chip on August 20.

To edit or remove it later, click the event chip on that day, then either change the details and click "Save," or click "Delete" to remove it.
