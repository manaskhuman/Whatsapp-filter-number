<div align="center">

# 📱 WhatsApp Number Filter

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2014.0.0-brightgreen.svg)](https://nodejs.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/rahmansurya/Whatsapp-filter-number/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, interactive, and powerful CLI-based tool to mass-filter and check if phone numbers are registered on WhatsApp. 

*Powered by the actively maintained [wwebjs/whatsapp-web.js](https://github.com/wwebjs/whatsapp-web.js) library.*

</div>

---

## 🚨 Status: Revived & 100% Working
> **Good news!** This repository has been completely overhauled. We migrated from the abandoned original library to the actively maintained `wwebjs` fork. All "No Valid QR Code" and Multi-Device versioning issues have been fully resolved.

---

## ✨ Key Features

- **CLI Interface:** Highly professional terminal UI with colored status indicators and tabular data formatting.
- **Bulk Checking:** Filter thousands of numbers automatically from a text file.
- **Auto-Reporting:** Automatically saves active numbers to `active_numbers.txt` with timestamps.
- **Smart Formatting:** Auto-cleans inputs (removes `+`, `-`, spaces). Automatically replaces local leading `0`s with a configurable default country code (default: `62`). Compatible globally!
- **Session Persistence:** Scan the QR code once, and your session is saved securely. Easy logout menu included.

## 📦 Installation

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

```bash
# Clone the repository
git clone https://github.com/rahmansurya/Whatsapp-filter-number.git

# Navigate into the directory
cd Whatsapp-filter-number

# Install all dependencies
npm install
```

## ⚙️ Configuration

By default, the script is configured for Indonesian numbers (`62`). If you are from another country, you can easily change the default country code by opening `app.js` and editing line 13:

```javascript
// ==========================================
// CONFIGURATION
// ==========================================
// Set your default country code here (without '+')
// This will replace the leading '0' in phone numbers.
// Example: '62' for Indonesia, '1' for US, '44' for UK, '91' for India
const DEFAULT_COUNTRY_CODE = '62'; 
// ==========================================
```
*Note: If you input numbers that already have their full international code (e.g. `1415...` or `4478...`), the script will automatically recognize them and will **not** modify them.*

## 🚀 Quick Start

1. Create a `numbers.txt` file in the root directory and add the numbers you want to check (one per line).

```text
# numbers.txt example:
081234567890
6285712345678
```

2. Run the application:

```bash
node app.js
```

3. **Link Device:** A QR code will appear in your terminal. Open WhatsApp on your **Primary Phone**, go to *Linked Devices*, and scan the QR code.
4. Once authenticated, follow the interactive on-screen menu to start filtering!

## 💡 Troubleshooting

- **No Valid QR Code:** If your phone refuses to scan the QR code, try maximizing your terminal window or zooming out (`Ctrl` + `-`) to ensure the QR code renders perfectly without line breaks. Ensure you are using your Primary Device to scan.
- **Session Issues:** Use the "Logout Device" feature in the main menu to cleanly wipe your session before scanning with a new device.

## ⚖️ Disclaimer
This tool is strictly for educational purposes. Automated bulk checking may violate WhatsApp's Terms of Service. Use at your own risk. The developer is not responsible for any blocked or banned accounts.


