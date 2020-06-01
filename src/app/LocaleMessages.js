
import ToolboxZh from '../locales/zh/toolbox.json';
import AttributesZh from '../locales/zh/attributes.json';
import ToolboxEn from '../locales/en/toolbox.json';
import AttributesEn from '../locales/en/attributes.json';

const EnMessages = {
    ...ToolboxEn,
    ...AttributesEn
}

const ZhMessages = {
    ...ToolboxZh,
    ...AttributesZh
}

export const messages = {
    en: EnMessages,
    zh: ZhMessages,
    "zh-CN": ZhMessages
}