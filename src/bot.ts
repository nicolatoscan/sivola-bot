import { Telegraf } from "telegraf";
import { parse } from 'node-html-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
let message = 'No message';

bot.start((ctx) => ctx.reply('Ciao, ti aggiorno su come vanno i posti'));
bot.command('ping', (ctx) => ctx.reply('pong'));
bot.command('posti', async (ctx) => { 
  await check();
  await ctx.reply(`messaggio: ${message}`)
});


async function check(): Promise<void> {
  const URL = `https://www.sivola.it/viaggi/corea-del-sud`;

  const page = await axios.get(URL)

  // return parse(page.data).querySelectorAll('div.periodo').map(name => name.innerText).join(',')
  const res = parse(page.data).querySelectorAll('#viaggio div.card-home')
    .map(x => {
      const giorno = x.querySelectorAll('.d-flex.align-items-center .text-center .h2').map(name => name.innerText)[0].trimStart().trimEnd()
      const mese = x.querySelectorAll('.d-flex.align-items-center .text-center .d-block').map(name => name.innerText)[0].trimStart().trimEnd()

      const data = `${giorno} ${mese}`
      if (data === '02 giu') {
        return x.querySelectorAll('.text-warning').map(name => name.innerText)[0].trimStart().trimEnd()
      }
      return null;

    }).find(x => x !== null) ?? ''

    if (res !== message) {
      message = res;
      bot.telegram.sendMessage(process.env.CHAT_ID ?? '', `messaggio: ${message}`)
      console.log(`messaggio: ${message}`)
    }
}
setInterval(() => {
  try {
    check()
  } catch (error) {
    console.log(error)
  }
  console.log('check done')
}, 1000 * 60 * 5)



process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
bot.launch();
console.log('Bot started');