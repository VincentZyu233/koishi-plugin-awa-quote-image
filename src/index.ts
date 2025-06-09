import { Context, h, Schema } from 'koishi'
import path from 'node:path';
import { readFile } from 'fs/promises';

import { renderQuoteImage } from './genImage';


export const inject = {
  required: ["puppeteer", "http"]
}


export const name = 'awa-quote'

// export interface Config {}

// export const Config: Schema<Config> = Schema.object({})

export const Config = Schema.intersect([
  Schema.object({
    fontPath: Schema
      .string()
      .default(path.join(__dirname, '../assets/SourceHanSerifSC-SemiBold.otf'))
      .description("字体文件绝对路径"),
    bgPath: Schema
      .string()
      .default(path.join(__dirname, '../assets/black.png'))
      .description("背景图片绝对路径"),
    image_width: Schema
      .number()
      .default(1920)
      .description("默认图片宽度"),
    image_height: Schema
      .number()
      .default(1080)
      .description("默认图片高度"),
    page_screenshotquality: Schema
    .number()
    .role('slider')
    .min(0).max(100).step(1)
    .default(60)
    .description("Puppeteer截图质量参数， 图片压缩质量, 范围0-100")
  })
    .description("quote图片相关配置"),
  
  Schema.object({
    verboseSessionLog: Schema
      .boolean()
      .default(false),
    verboseConsoleLog: Schema
      .boolean()
      .default(false),
  })
    .description("debug settings")
  
])

export function apply(ctx: Context, config) {

  ctx.command(
    "aqt",
    "awa_quote"
  )
    .action( async ( {session, options} ) => {

      if ( !session.quote ){
        let msg_noquote = "plz quote a msg.";
        await session.send(h.quote(session.messageId) + msg_noquote);
        return;
      }

      const session_user = await session.bot.getUser(session.quote.user.id, session.event.guild.id);
      const avatar_buffer = await ctx.http.file(session_user.avatar);
      const avatar_base64 = Buffer.from(avatar_buffer.data).toString('base64');

      ctx.logger.info(`font path in config: ${config.fontPath}`);

      const font_base64 = await fileToBase64(config.fontPath);
      const bg_base64 = await fileToBase64(config.bgPath);

      let debugMsg = "[debug]\n";
      debugMsg += `用户名：${session_user.name}\n`;
      debugMsg += `用户头像：${h.image(session_user.avatar)}\n`;


      if ( config.verboseSessionLog ){
        await session.send(debugMsg);
      }
      if ( config.verboseConsoleLog ){
        ctx.logger.info(debugMsg);
      }

      const res = await renderQuoteImage(
        ctx,
        {
          sentence: session.quote.content,
          username: session_user.name,
          avatarBase64: avatar_base64,
          width: config.image_width,
          height: config.image_height,
          fontBase64: font_base64,
          bgBase64: bg_base64,
          page_screenshotquality: config.page_screenshotquality
        }
      )

      await session.send(
        h(
          'image',
          { url: 'data:image/png;base64,' + res}
        )
      )

    })

    async function fileToBase64(filePath: string): Promise<string> {
      try {
          const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
          const buffer = await readFile(absolutePath);
          return buffer.toString('base64');
      } catch (error) {
          ctx.logger.error(`文件转换成base64失败: ${error.message}`);
          throw error;
      }
  }

}
