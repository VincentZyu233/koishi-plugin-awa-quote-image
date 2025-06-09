import { Context } from 'koishi';
import { } from 'koishi-plugin-puppeteer';
import fs, { read, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises';
import path from 'node:path'

// export const inject = {
//     required: ["puppeteer", "http"]
// }

const defaultTemplate = async (options: {
    sentence: string;
    username: string;
    avatarBase64: string;
    width?: number;
    height?: number;
    fontBase64: string;
    bgBase64: string;
  }): Promise<string> => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      @font-face {
        font-family: 'CustomFont';
        src: url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');
      }
  
      body {
        margin: 0;
        padding: 0;
        width: ${options.width}px;
        height: ${options.height}px;
        background: url(data:image/png;base64,${options.bgBase64}) no-repeat center center;
        background-size: cover;
        display: flex;
        align-items: center;
        font-family: 'CustomFont', sans-serif;
        color: #ffffff;
      }
  
      .avatar {
        width: 333px;
        height: 333px;
        margin-left: 40px;
        border-radius: 100px;
        background-image: url(data:image/png;base64,${options.avatarBase64});
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
      }
  
      .quote {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 20px 40px;
        flex: 1;
      }
  
      .sentence {
        font-size: 48px;
        margin-bottom: 16px;
        word-break: break-word;
        line-height: 1.3;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
      }
  
      .username {
        font-size: 54px;
        opacity: 0.8;
        text-align: right;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
    </style>
  </head>
  <body>
    <div class="avatar"></div>
    <div class="quote">
      <div class="sentence">"${options.sentence}"</div>
      <div class="username">—— ${options.username}</div>
    </div>
  </body>
  </html>
  `;
  

export async function renderQuoteImage(
    ctx: Context,
    args:{
        sentence: string;
        username: string;
        avatarBase64: string;
        width?: number;
        height?: number; 
        fontBase64: string; 
        bgBase64: string;
        page_screenshotquality: number;
    }
) {

    const browserPage = await ctx.puppeteer.page();

    try {

        const html = await defaultTemplate({
            sentence: args.sentence,
            username: args.username,
            avatarBase64: args.avatarBase64,
            width: args.width,
            height: args.height,
            fontBase64: args.fontBase64,
            bgBase64: args.bgBase64,
        })


        writeFileSync(path.join(__dirname, 'tmp.html'), html)

        browserPage.on('console', msg => {
            ctx.logger.debug(`Puppeteer console: ${msg.text()}`);
        });
        browserPage.on('pageerror', error => {
            ctx.logger.error(`Puppeteer page error: ${error.message}`);
        });

        await browserPage.setContent(html);
        await browserPage.setViewport({ width: args.width, height: args.height });

        const res = await browserPage.screenshot({
            encoding: 'base64',
            type: 'jpeg',
            omitBackground: true,
            fullPage: true,
            quality: args.page_screenshotquality
        })

        return res;

    } catch(err) {
        ctx.logger.error(`error: ${err}`);
    } finally {
        // await browserPage.close();
    }

}