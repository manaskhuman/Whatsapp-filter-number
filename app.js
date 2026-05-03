const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const fs = require('fs');
const readline = require('readline');

// ==========================================
// CONFIGURATION
// ==========================================
// Set your default country code here (without '+')
// This will replace the leading '0' in phone numbers.
// Example: '62' for Indonesia, '1' for US, '44' for UK, '91' for India
const DEFAULT_COUNTRY_CODE = '62';
// ==========================================

const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

class App {
   constructor() {
      this.client = null;
      this.isAuthenticated = false;
   }

   clearScreen() {
      console.clear();
      console.log(chalk.cyan.bold('='.repeat(55)));
      console.log(chalk.cyan.bold('        WHATSAPP NUMBER FILTER'));
      console.log(chalk.cyan.bold('='.repeat(55) + '\n'));
   }

   async start() {
      try {
         this.clearScreen();
         console.log(chalk.yellow(' Starting WhatsApp Web Client...'));

         this.client = new Client({
            authStrategy: new LocalAuth({
               clientId: 'whatsapp-checker'
            }),
            puppeteer: {
               args: ['--no-sandbox', '--disable-setuid-sandbox']
            },
            webVersionCache: {
               type: 'local'
            }
         });

         this.client.on('qr', (qr) => {
            console.log(chalk.cyan('\n📱 Scan the QR code using your primary device:\n'));
            qrcode.generate(qr, { small: true });
         });

         this.client.on('authenticated', () => {
            console.log(`${chalk.green('✓')} Authentication successful`);
         });

         this.client.on('ready', async () => {
            this.isAuthenticated = true;
            const clientInfo = this.client.info;

            this.clearScreen();
            console.log(`${chalk.green('✓')} Client connected successfully`);
            console.log(`${chalk.cyan('•')} Account : ${chalk.white(clientInfo?.pushname || 'Unknown')}`);
            console.log(`${chalk.cyan('•')} Number  : ${chalk.white(clientInfo?.wid?.user || 'Unknown')}\n`);

            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showMenu();
         });

         this.client.on('auth_failure', (msg) => {
            console.log(`\n${chalk.bgRed.white.bold(' ✗ ERROR ')} Authentication failed: ${msg}`);
            this.isAuthenticated = false;
         });

         this.client.on('disconnected', (reason) => {
            console.log(`\n${chalk.bgYellow.black.bold(' ! WARNING ')} Client disconnected: ${reason}`);
            this.isAuthenticated = false;
            console.log(chalk.gray('Type anything and press Enter to exit...'));
         });

         await this.client.initialize();

      } catch (error) {
         console.error(`\n${chalk.bgRed.white.bold(' ✗ FATAL ')} Failed to start application:`, error.message);
      }
   }

   async showMenu() {
      this.clearScreen();
      console.log(chalk.yellow.bold('  MAIN MENU '));
      console.log(chalk.gray('-------------------------------------------------------'));
      console.log(`  ${chalk.cyan.bold('[1]')} Check Numbers from File ${chalk.gray('(numbers.txt)')}`);
      console.log(`  ${chalk.cyan.bold('[2]')} Check Number Manually`);
      console.log(`  ${chalk.cyan.bold('[3]')} Logout Device`);
      console.log(`  ${chalk.cyan.bold('[4]')} Exit Application`);
      console.log(chalk.gray('-------------------------------------------------------\n'));

      const answer = await question(chalk.white.bold(' ❯ Select menu (1-4): '));

      switch (answer.trim()) {
         case '1':
            await this.checkNumbersTxt();
            break;
         case '2':
            await this.checkManual();
            break;
         case '3':
            await this.logoutDevice();
            break;
         case '4':
            console.log(chalk.green('\n Exiting application. Goodbye!\n'));
            await this.client.destroy();
            process.exit(0);
            break;
         default:
            console.log(chalk.red('\n✗ Invalid selection! Please try again.'));
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showMenu();
      }
   }

   formatNumber(number) {
      // Remove all non-numeric characters (like spaces, +, -, etc)
      let formattedNumber = number.toString().replace(/\D/g, '');

      // If the number starts with '0', replace it with the default country code
      if (formattedNumber.startsWith('0')) {
         formattedNumber = DEFAULT_COUNTRY_CODE + formattedNumber.substring(1);
      }

      return formattedNumber;
   }

   async checkNumbersTxt() {
      try {
         this.clearScreen();
         const filesTxt = 'numbers.txt';
         const reportTxt = 'active_numbers.txt';

         if (!fs.existsSync(filesTxt)) {
            console.log(`${chalk.bgRed.white.bold(' ✗ ERROR ')} File ${chalk.yellow(filesTxt)} not found`);
            await question(chalk.gray('\nPress Enter to return to menu...'));
            return this.showMenu();
         }

         const numberRaw = fs.readFileSync(filesTxt, 'utf8');
         const numberlist = numberRaw
            .replace(/\r/g, ' ')
            .replace(/\//g, '')
            .replace(/\n/g, '')
            .replace(/^\s*/, '')
            .split(' ')
            .filter(num => num.trim() !== '');

         if (numberlist.length === 0) {
            console.log(`${chalk.bgYellow.black.bold(' ! WARNING ')} File ${chalk.yellow(filesTxt)} is empty`);
            await question(chalk.gray('\nPress Enter to return to menu...'));
            return this.showMenu();
         }

         console.log(chalk.yellow.bold(` CHECKING ${numberlist.length} NUMBERS... \n`));

         // Tabular Header
         console.log(chalk.cyan.bold(` ${'PHONE NUMBER'.padEnd(22)} | STATUS `));
         console.log(chalk.gray('-------------------------------------------------------'));

         let activeCount = 0;
         let activeNumbers = [];

         for (let i = 0; i < numberlist.length; i++) {
            const number = numberlist[i];

            try {
               const formattedNumber = this.formatNumber(number);
               const formattedTarget = formattedNumber + '@c.us';

               const isRegistered = await this.client.isRegisteredUser(formattedTarget);

               if (isRegistered) {
                  console.log(` ${chalk.white(number.padEnd(22))} | ${chalk.green.bold('ACTIVE')} `);
                  activeNumbers.push(number);
                  activeCount++;
               } else {
                  console.log(` ${chalk.gray(number.padEnd(22))} | ${chalk.bgRed.white.bold(' UNREGISTERED ')} `);
               }

            } catch (error) {
               console.log(` ${chalk.red(number.padEnd(22))} | ${chalk.bgRed.white.bold('   ERROR   ')} `);
            }

            if (i < numberlist.length - 1) {
               await new Promise(resolve => setTimeout(resolve, 3000));
            }
         }

         console.log(chalk.gray('-------------------------------------------------------'));

         if (activeNumbers.length > 0) {
            const timeStr = new Date().toLocaleString('id-ID');
            let content = `\n--- Report: ${timeStr} ---\n`;
            content += activeNumbers.join('\n') + '\n';

            fs.appendFileSync(reportTxt, content);
            console.log(`\n${chalk.green('✓')} Saved ${chalk.bold(activeCount)} active numbers to ${chalk.cyan(reportTxt)}`);
         } else {
            console.log(`\n${chalk.yellow('!')} No active numbers found`);
         }

         console.log(chalk.green('✓ Checking completed.'));
         await question(chalk.gray('\nPress Enter to return to menu...'));
         this.showMenu();

      } catch (error) {
         console.error(`\n${chalk.bgRed.white.bold(' ✗ ERROR ')} Error while checking numbers:`, error.message);
         await question(chalk.gray('\nPress Enter to return to menu...'));
         this.showMenu();
      }
   }

   async checkManual() {
      this.clearScreen();
      console.log(chalk.yellow.bold(' MANUAL NUMBER CHECK \n'));

      const number = await question(
         chalk.cyan(' ❯ Enter number ') + chalk.gray('(example: 0812... / 62812...) : ')
      );

      if (!number || number.trim() === '') {
         console.log(chalk.red('\n✗ Number cannot be empty'));
         await question(chalk.gray('\nPress Enter to return to menu...'));
         return this.showMenu();
      }

      console.log(chalk.gray('\nChecking number...\n'));

      try {
         const formattedNumber = this.formatNumber(number);
         const formattedTarget = formattedNumber + '@c.us';

         const isRegistered = await this.client.isRegisteredUser(formattedTarget);

         console.log(chalk.gray('-------------------------------------------------------'));
         if (isRegistered) {
            console.log(` ${chalk.white(number.padEnd(22))} | ${chalk.green.bold('ACTIVE')} `);
         } else {
            console.log(` ${chalk.gray(number.padEnd(22))} | ${chalk.bgRed.white.bold(' UNREGISTERED ')} `);
         }
         console.log(chalk.gray('-------------------------------------------------------'));

      } catch (error) {
         console.log(chalk.red(`\n✗ ERROR: ${error.message}`));
      }

      await question(chalk.gray('\nPress Enter to return to menu...'));
      this.showMenu();
   }

   async logoutDevice() {
      console.log('');
      const confirm = await question(
         chalk.red(' ❯ Are you sure you want to logout? You will need to scan the QR code again. (y/n): ')
      );

      if (confirm.toLowerCase() === 'y') {
         try {
            console.log(chalk.yellow('\n Logging out...'));
            await this.client.logout();
            console.log(chalk.green('\n✓ Logout successful. Please restart the application to log in again.\n'));
            process.exit(0);
         } catch (error) {
            console.log(chalk.red(`\n✗ Error while logging out: ${error.message}`));
            await question(chalk.gray('\nPress Enter to return to menu...'));
            this.showMenu();
         }
      } else {
         this.showMenu();
      }
   }
}

const whatsappApp = new App();
whatsappApp.start(); 