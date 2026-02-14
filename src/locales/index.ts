import zhCN from './zh-CN';
import enUS from './en-US';
import trTR from './tr-TR';

export type Locale = 'zh-CN' | 'en-US' | 'tr-TR';

export const messages: Record<Locale, typeof zhCN> = {
    'zh-CN': zhCN,
    'en-US': enUS,
    'tr-TR': trTR,
};

export const localeNames: Record<Locale, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'tr-TR': 'Türkçe',
};

export { zhCN, enUS, trTR };
