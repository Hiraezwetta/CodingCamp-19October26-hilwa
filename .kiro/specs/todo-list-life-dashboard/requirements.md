# Requirements Document

## Introduction

The Todo List Life Dashboard is a web-based personal dashboard that greets the user with the current time, date, and a time-of-day greeting, and consolidates productivity tools into a single page: a 25-minute Focus Timer, a persistent To-Do List, and Quick Links to favorite websites. The Dashboard runs entirely in the browser using HTML, CSS, and Vanilla JavaScript with no backend server, persisting all user data client-side through the browser Local Storage API. The Dashboard supports task sorting, duplicate-task prevention, and a light/dark theme toggle. The Dashboard is designed as a clean, minimal interface that is easy to understand and use, with no complex setup required.

## Glossary

- **Dashboard**: The Todo List Life Dashboard web application that hosts all components described in this document.
- **Focus_Timer**: The 25-minute countdown timer component of the Dashboard.
- **Todo_List**: The task management component that stores, displays, and manipulates tasks.
- **Task**: A single to-do item managed by the Todo_List, consisting of text, a creation date, and a completion status.
- **Quick_Links**: The component that displays buttons opening the user's favorite websites.
- **Local_Storage**: The browser Local Storage Web API used for client-side data persistence.
- **Theme**: The visual appearance mode of the Dashboard, either light or dark.

## Requirements

### Requirement 1: Time and Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting, so that I have a personalized overview when I open the Dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current time, based on the user's local device time, updating the display at least once per minute.
2. THE Dashboard SHALL display the current date, including the day, month, and year, based on the user's local device time.
3. WHEN the current time is between 05:00 and 11:59, THE Dashboard SHALL display a "Good Morning" greeting.
4. WHEN the current time is between 12:00 and 16:59, THE Dashboard SHALL display a "Good Afternoon" greeting.
5. WHEN the current time is between 17:00 and 20:59, THE Dashboard SHALL display a "Good Evening" greeting.
6. WHEN the current time is between 21:00 and 04:59, THE Dashboard SHALL display a "Good Night" greeting.

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute focus timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL count down from 25 minutes.
2. WHEN the Start control is pressed, THE Focus_Timer SHALL begin counting down from the current remaining time.
3. WHEN the Stop control is pressed, THE Focus_Timer SHALL pause the countdown at the current remaining time.
4. WHEN the Reset control is pressed, THE Focus_Timer SHALL stop the countdown and restore the remaining time to 25 minutes.
5. WHEN the Focus_Timer reaches zero, THE Dashboard SHALL display a visual or audio completion notification.

### Requirement 3: Todo List Management

**User Story:** As a user, I want to add, edit, mark complete, and delete tasks, so that I can track my to-do items.

#### Acceptance Criteria

1. WHEN a user enters Task text of 1 to 200 characters and confirms the add action, THE Todo_List SHALL add a new Task to the list with the entered text, the current date as the creation date, and an incomplete completion status.
2. WHEN the user edits a Task text to between 1 and 200 characters and confirms the edit, THE Todo_List SHALL update the Task text.
3. WHEN the user marks a Task as done, THE Todo_List SHALL set the Task completion status to complete and display the Task with a visual state distinct from incomplete Tasks.
4. WHEN the user deletes a Task, THE Todo_List SHALL remove the Task from the list.
5. WHEN a Task is added, edited, marked complete, or deleted, THE Todo_List SHALL persist the updated Task list to Local_Storage.
6. WHEN the Dashboard is reloaded, THE Todo_List SHALL restore all Tasks from Local_Storage with their original text, creation date, and completion status.
7. IF a user submits Task text that is empty, whitespace-only, or exceeds 200 characters, THEN THE Todo_List SHALL reject the submission and display an error indication without modifying the Task list.

### Requirement 4: Quick Links

**User Story:** As a user, I want clickable buttons for favorite websites, so that I can quickly access my most-used sites.

#### Acceptance Criteria

1. THE Quick_Links SHALL display, for each configured website defined by a website name and a website URL, a button labeled with the website name, supporting a maximum of 12 configured links.
2. WHEN a Quick_Links button is pressed, THE Dashboard SHALL open the website URL associated with that button in a new browser tab.
3. WHEN a configured link is added, removed, or modified, THE Quick_Links SHALL persist all configured links to Local_Storage.
4. WHEN the Dashboard is reloaded, THE Quick_Links SHALL restore all links from Local_Storage.
5. IF a Quick_Links button is pressed and its associated website URL is invalid, THEN THE Dashboard SHALL display an error message indicating the URL is invalid and SHALL NOT open a new browser tab.

### Requirement 5: Task Sorting

**User Story:** As a user, I want to sort my tasks, so that I can organize them by name, status, or creation date.

#### Acceptance Criteria

1. THE Todo_List SHALL provide sorting options for name, status, and creation date.
2. WHEN the user selects the name sorting option, THE Todo_List SHALL reorder the Tasks in case-insensitive alphabetical ascending order from A to Z.
3. WHEN the user selects the creation date sorting option, THE Todo_List SHALL reorder the Tasks from the oldest creation date to the newest creation date.
4. WHEN the user selects the status sorting option, THE Todo_List SHALL reorder the Tasks in alphabetical ascending order of the status name.

### Requirement 6: Duplicate Task Prevention

**User Story:** As a user, I want to be warned when adding a duplicate task, so that I avoid redundant entries.

#### Acceptance Criteria

1. IF a user attempts to add a Task whose text, after trimming leading and trailing whitespace and ignoring character case, matches the text of an existing Task in the Todo_List, THEN THE Dashboard SHALL display a pop-up warning indicating that a duplicate Task already exists and that the Task was not added.
2. WHEN a Task is rejected as a duplicate, THE Todo_List SHALL not add the duplicate Task to the list and SHALL retain the entered Task text without modification.

### Requirement 7: Light/Dark Mode Toggle

**User Story:** As a user, I want to toggle between light and dark themes, so that I can choose a comfortable visual appearance.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Theme toggle control that indicates the currently active Theme (light or dark).
2. WHEN the user toggles the Theme, THE Dashboard SHALL switch all visible UI elements between light and dark modes.
3. WHEN the user toggles the Theme, THE Dashboard SHALL persist the selected Theme in Local_Storage.
4. WHEN the Dashboard is reloaded, THE Dashboard SHALL restore the selected Theme from Local_Storage.
5. IF the Dashboard is loaded with no previously stored Theme in Local_Storage, THEN THE Dashboard SHALL default to light mode.

### Requirement 8: Browser Compatibility and Standalone Operation

**User Story:** As a user, I want the Dashboard to work in modern browsers without a server, so that I can use it in my preferred environment.

#### Acceptance Criteria

1. THE Dashboard SHALL render all components and execute all interactive functions in Chrome, Firefox, Edge, and Safari.
2. THE Dashboard SHALL run entirely in the browser without requiring or making any calls to a backend server.
3. THE Dashboard SHALL consist only of static files that can be deployed through GitHub Pages.

### Requirement 9: Client-Side Data Persistence

**User Story:** As a user, I want my data saved on my device, so that it persists between sessions without requiring a server account.

#### Acceptance Criteria

1. WHEN the user creates, updates, or deletes data, THE Dashboard SHALL store the data using the Local_Storage API.
2. THE Dashboard SHALL keep all data on the client side only, without transmitting data to any external server.
3. WHEN the Dashboard is loaded in a new session, THE Dashboard SHALL retrieve and display previously stored data from Local_Storage.
4. IF the Local_Storage API is unavailable or a storage quota is exceeded, THEN THE Dashboard SHALL display an error indication and SHALL retain the current session data until the session ends.

### Requirement 10: Performance

**User Story:** As a user, I want the Dashboard to respond quickly, so that I do not experience lag during interactions.

#### Acceptance Criteria

1. THE Dashboard SHALL render all initial interface components, including data restored from Local_Storage, in an interactive state within 2 seconds, measured from the page navigation request, in Chrome, Firefox, Edge, or Safari.
2. WHEN the user adds, edits, marks complete, or deletes a Task, or toggles the Theme, THE Dashboard SHALL update the corresponding visual display within 200 milliseconds, measured from the triggering user input action.

### Requirement 11: Visual Design and Code Structure

**User Story:** As a developer, I want a clean interface and organized code structure, so that the Dashboard is maintainable and easy to use.

#### Acceptance Criteria

1. THE Dashboard SHALL style all components using a single CSS file located in the css/ directory.
2. THE Dashboard SHALL implement all behavior using a single JavaScript file located in the js/ directory.
3. THE Dashboard SHALL use a base font size of at least 16 pixels to ensure readable typography.
4. THE Dashboard SHALL display a heading for each component section with a font size at least 4 pixels larger than the body text font size.
5. THE Dashboard SHALL separate each component section from adjacent sections with visible spacing.
