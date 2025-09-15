# Apple Store Monitor

A Node.js script that monitors in-store Apple product availability (ex. iPhones, iPads) and sends real-time Discord notifications via Discord. Orginally developed during the global-chip shortage during COVID-19 to help users secure devices.

> ⚠️ This code is super outdated and may no longer work with Apple's current API

## Features
- Configurable search based on zip code
- Discord webhook notifications for live updates
- Lightweight CLI script

## Tech Stack
- [Node.js](https://nodejs.org/)
- [Discord.js](https://discord.js.org/) v12.4.0
- [request-promise](https://www.npmjs.com/package/request-promise)
- [delay](https://www.npmjs.com/package/delay)
- [colors](https://www.npmjs.com/package/colors)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/jiancg/Apple-Store-Monitor.git
cd apple-store-monitor
```

### 2. Install dependecies
```bash
npm install
```


### 3. Run the script
```bash
node monitor.js
```
