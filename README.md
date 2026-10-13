# CallApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Install as an app and reminders

The production build includes a web app manifest and Angular service worker, making the calendar installable as a PWA on supported browsers. Serve the production build over HTTPS (or localhost) to install it. Appointments are saved locally on the device. Enable desktop notifications from the calendar to allow the browser to show operating-system notifications when the app is minimized or in a background tab. When the calendar is in the foreground, reminders appear as an in-app toast.

Notifications require browser permission, and their screen position is controlled by the operating system's notification settings. Reminders do not run after the app/browser is closed. Closed-app mobile notifications require appointments to be stored by a server and delivered using Web Push; that backend is not included in this project. Locally saved appointments are not synchronized across devices.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
