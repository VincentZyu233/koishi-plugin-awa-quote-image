import { Context } from 'koishi';
import { } from 'koishi-plugin-puppeteer';
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { IMAGE_TYPES, ImageStyleKey, ImageType } from './type';
import { ImageStyleDetail } from '.';

interface TemplateOptions {
    sentence: string;
    username: string;
    avatarBase64: string;
    width: number;
    minHeight: number;
    fontBase64: string;
    enableDarkMode: boolean; // 新增参数
}

const getFontSize = (sentenceLength: number, baseSize: number, decreaseRate: number, threshold: number) =>
    sentenceLength < threshold ? baseSize - decreaseRate * sentenceLength : baseSize - decreaseRate * threshold;

const getTimestamp = () => {
    return new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

const getOriginBlackWhiteTemplateStr = async (options: TemplateOptions): Promise<string> => {
    const sentenceLength = options.sentence.length;
    const sentenceFontSize = getFontSize(sentenceLength, 100, 0.40, 100);
    const usernameFontSize = getFontSize(sentenceLength, 90, 0.36, 100);
    const timestamp = getTimestamp();

    const css = options.enableDarkMode
        ? // 黑暗模式（保持原样）
        `@font-face{font-family:'CustomFont';src:url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');}body{margin:0;padding:0;width:${options.width}px;min-height:${options.minHeight}px;background:#000;display:flex;align-items:center;font-family:'CustomFont',sans-serif;color:#fff;position:relative;}#content-wrapper{display:flex;align-items:center;}.avatar{width:333px;height:333px;margin-left:40px;border-radius:100px;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;flex-shrink:0;}.quote{display:flex;flex-direction:column;justify-content:center;padding:20px 40px;flex:1;}.sentence{font-size:${sentenceFontSize}px;margin-bottom:16px;word-break:break-word;line-height:1.3;text-shadow:2px 2px 4px rgba(0,0,0,0.6);}.username{font-size:${usernameFontSize}px;opacity:0.8;text-align:right;text-shadow:1px 1px 2px rgba(0,0,0,0.5);}.timestamp{font-size:24px;color:rgba(255,255,255,0.6);text-align:right;margin-top:8px;}`
        : // 白天模式（新增）
        `@font-face{font-family:'CustomFont';src:url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');}body{margin:0;padding:0;width:${options.width}px;min-height:${options.minHeight}px;background:#fff;display:flex;align-items:center;font-family:'CustomFont',sans-serif;color:#000;position:relative;}#content-wrapper{display:flex;align-items:center;}.avatar{width:333px;height:333px;margin-left:40px;border-radius:100px;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;flex-shrink:0;}.quote{display:flex;flex-direction:column;justify-content:center;padding:20px 40px;flex:1;}.sentence{font-size:${sentenceFontSize}px;margin-bottom:16px;word-break:break-word;line-height:1.3;text-shadow:1px 1px 2px rgba(255,255,255,0.6);}.username{font-size:${usernameFontSize}px;opacity:0.8;text-align:right;text-shadow:0 0 1px rgba(255,255,255,0.5);}.timestamp{font-size:24px;color:rgba(0,0,0,0.6);text-align:right;margin-top:8px;}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${css}</style>
</head>
<body>
    <div id="content-wrapper">
        <div class="avatar"></div>
        <div class="quote">
            <div class="sentence">"${options.sentence}"</div>
            <div class="username">—— ${options.username}</div>
            <div class="timestamp">${timestamp}</div>
        </div>
    </div>
</body>
</html>
`;
};

const getModernSourceHanSerifSCTemplateStr = async (options: TemplateOptions): Promise<string> => {
    const sentenceLength = options.sentence.length;
    const sentenceFontSize = getFontSize(sentenceLength, 90, 0.35, 100);
    const usernameFontSize = getFontSize(sentenceLength, 80, 0.32, 100);
    const timestamp = getTimestamp();

    const cardWidth = options.width * 0.9;
    const avatarSize = 200;

    const css = options.enableDarkMode
        ? // 黑暗模式（新增）
        `@font-face{font-family:'CustomFont';src:url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');}body{margin:0;padding:9px;width:${options.width}px;min-height:${options.minHeight}px;height:auto;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-family:'CustomFont',sans-serif;color:#fff;position:relative;}#content-wrapper{margin:36px;display:flex;align-items:center;justify-content:flex-start;width:${cardWidth}px;backdrop-filter:blur(20px) saturate(180%);background-color:rgba(0,0,0,0.55);box-shadow:0 8px 32px rgba(0,0,0,0.2);border-radius:32px;padding:40px 60px;gap:40px;flex-direction:row;} .avatar{width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,0.2);}.quote{display:flex;flex-direction:column;justify-content:center;flex:1;}.sentence{font-size:${sentenceFontSize}px;margin-bottom:16px;word-break:break-word;line-height:1.3;color:#fff;text-shadow:0 0 6px rgba(0,0,0,0.4);white-space:pre-wrap;}.username{font-size:${usernameFontSize}px;opacity:0.75;text-align:right;color:#fff;text-shadow:0 0 4px rgba(0,0,0,0.3);}.timestamp{font-size:20px;color:rgba(255,255,255,0.6);text-align:right;margin-top:8px;}`
        : // 白天模式（保持原样）
        `@font-face{font-family:'CustomFont';src:url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');}body{margin:0;padding:9px;width:${options.width}px;min-height:${options.minHeight}px;height:auto;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-family:'CustomFont',sans-serif;color:#000;position:relative;}#content-wrapper{margin:36px;display:flex;align-items:center;justify-content:flex-start;width:${cardWidth}px;backdrop-filter:blur(20px) saturate(180%);background-color:rgba(255,255,255,0.55);box-shadow:0 8px 32px rgba(0,0,0,0.2);border-radius:32px;padding:40px 60px;gap:40px;flex-direction:row;}.avatar{width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,0.2);}.quote{display:flex;flex-direction:column;justify-content:center;flex:1;}.sentence{font-size:${sentenceFontSize}px;margin-bottom:16px;word-break:break-word;line-height:1.3;color:#000;text-shadow:0 0 6px rgba(255,255,255,0.4);white-space:pre-wrap;}.username{font-size:${usernameFontSize}px;opacity:0.75;text-align:right;color:#000;text-shadow:0 0 4px rgba(255,255,255,0.3);}.timestamp{font-size:20px;color:rgba(0,0,0,0.6);text-align:right;margin-top:8px;}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${css}</style>
</head>
<body>
    <div id="content-wrapper">
        <div class="avatar"></div>
        <div class="quote">
            <div class="sentence">"${options.sentence}"</div>
            <div class="username">—— ${options.username}</div>
            <div class="timestamp">${timestamp}</div>
        </div>
    </div>
</body>
</html>
`;
};


const getCleanLXGWWenkaiTemplateStr = async (options: TemplateOptions): Promise<string> => {
    const sentenceLength = options.sentence.length;
    const sentenceFontSize = getFontSize(sentenceLength, 88, 0.34, 100);
    const usernameFontSize = getFontSize(sentenceLength, 76, 0.30, 100);
    const timestamp = getTimestamp();

    const css = options.enableDarkMode
        ? // 黑暗模式（新增）
        `@font-face{font-family:'CustomFont';src:url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');}body{margin:0;padding:0;width:${options.width}px;min-height:${options.minHeight}px;display:flex;align-items:center;justify-content:center;font-family:'CustomFont',sans-serif;color:#eee;position:relative;background-color:#222;}#content-wrapper{display:flex;align-items:center;background-color:rgba(0,0,0,0.8);border-radius:24px;padding:32px 48px;gap:32px;box-shadow:0 2px 12px rgba(0,0,0,0.3);}.avatar{width:240px;height:240px;border-radius:32px;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;flex-shrink:0;}.quote{display:flex;flex-direction:column;justify-content:center;flex:1;}.sentence{font-size:${sentenceFontSize}px;margin-bottom:14px;word-break:break-word;line-height:1.4;color:#f0f0f0;}.username{font-size:${usernameFontSize}px;opacity:0.7;text-align:right;color:#aaa;}.timestamp{font-size:20px;color:rgba(255,255,255,0.6);text-align:right;margin-top:6px;}`
        : // 白天模式（已修改，用户名颜色为淡蓝色）
        `@font-face{font-family:'CustomFont';src:url(data:font/truetype;charset=utf-8;base64,${options.fontBase64}) format('truetype');}body{margin:0;padding:0;width:${options.width}px;min-height:${options.minHeight}px;display:flex;align-items:center;justify-content:center;font-family:'CustomFont',sans-serif;color:#333;position:relative;background-color:#f0f0f0;}#content-wrapper{display:flex;align-items:center;background-color:rgba(255,255,255,0.92);border-radius:24px;padding:32px 48px;gap:32px;box-shadow:0 2px 12px rgba(0,0,0,0.08);}.avatar{width:240px;height:240px;border-radius:32px;background-image:url(data:image/png;base64,${options.avatarBase64});background-size:cover;background-position:center;flex-shrink:0;}.quote{display:flex;flex-direction:column;justify-content:center;flex:1;}.sentence{font-size:${sentenceFontSize}px;margin-bottom:14px;word-break:break-word;line-height:1.4;color:#222;}.username{font-size:${usernameFontSize}px;opacity:0.7;text-align:right;color:#4A90E2;}.timestamp{font-size:20px;color:rgba(0,0,0,0.6);text-align:right;margin-top:6px;}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${css}</style>
</head>
<body>
    <div id="content-wrapper">
        <div class="avatar"></div>
        <div class="quote">
            <div class="sentence">"${options.sentence}"</div>
            <div class="username">—— ${options.username}</div>
            <div class="timestamp">${timestamp}</div>
        </div>
    </div>
</body>
</html>
`;
};


export async function renderQuoteImage(
    ctx: Context,
    args: {
        sentence: string,           username: string,           avatarBase64: string,
        width: number,               minHeight: number,
        selectedStyle: ImageStyleKey,  fontBase64: string,           enableDarkMode: boolean,
        imageType: ImageType,        pageScreenshotquality: number,
    }
) {
    const browserPage = await ctx.puppeteer.page();
    let html: string;

    try {
        const templateOptions: TemplateOptions = {
            sentence: args.sentence,
            username: args.username,
            avatarBase64: args.avatarBase64,
            width: args.width,
            minHeight: args.minHeight,
            fontBase64: args.fontBase64,
            enableDarkMode: args.enableDarkMode, // 传递enableDarkMode参数
        };

        switch (args.selectedStyle) {
            case 'ORIGIN_BLACK_WHITE':
                html = await getOriginBlackWhiteTemplateStr(templateOptions);
                break;
            case 'MODERN_SOURCE_HAN_SERIF_SC':
                html = await getModernSourceHanSerifSCTemplateStr(templateOptions);
                break;
            case 'CLEAN_LXGW_WENKAI':
                html = await getCleanLXGWWenkaiTemplateStr(templateOptions);
                break;
            default:
                html = await getOriginBlackWhiteTemplateStr(templateOptions);
        }

        // writeFileSync(path.join(__dirname, 'tmp.html'), html);

        browserPage.on('console', msg => {
            ctx.logger.debug(`Puppeteer console: ${msg.text()}`);
        });
        browserPage.on('pageerror', error => {
            ctx.logger.error(`Puppeteer page error: ${error.message}`);
        });

        await browserPage.setContent(html);
        await browserPage.setViewport({ width: args.width, height: 9999 });

        await browserPage.waitForSelector('body', { timeout: 5000 });

        const wrapperId = args.selectedStyle === 'MODERN_SOURCE_HAN_SERIF_SC' ? 'body' : '#content-wrapper';
        const element = await browserPage.$(wrapperId);

        const res = await element.screenshot({
            encoding: 'base64',
            type: args.imageType,
            ...(args.imageType !== IMAGE_TYPES.PNG && { quality: args.pageScreenshotquality })
        });

        return res;

    } catch (err) {

        ctx.logger.error(`error: ${err}`);

    } finally {

        await browserPage.close();

    }
}