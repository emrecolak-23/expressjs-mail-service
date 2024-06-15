"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacePlaceHolder = void 0;
function replacePlaceHolder(template, data) {
    if (data.length === 0)
        return template;
    console.log("queue properties", data);
    for (const { key, value } of data) {
        const placeholder = `{{${key}}}`;
        const regexPattern = new RegExp(placeholder
            .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
            .replace(/[çÇ]/g, '[cÇ]')
            .replace(/[ğĞ]/g, '[gĞ]')
            .replace(/[ıİ]/g, '[ıİ]')
            .replace(/[öÖ]/g, '[oÖ]')
            .replace(/[şŞ]/g, '[sŞ]')
            .replace(/[üÜ]/g, '[uÜ]'), 'g');
        console.log(key, value);
        const sanitizedValue = replaceTurkishCharacters(value);
        console.log("replaced sanitizedValue", sanitizedValue);
        template = template.replace(regexPattern, sanitizedValue);
    }
    return template;
}
exports.replacePlaceHolder = replacePlaceHolder;
function replaceTurkishCharacters(text) {
    const charMapping = {
        'ç': 'c',
        'Ç': 'C',
        'ğ': 'g',
        'Ğ': 'G',
        'ı': 'i',
        'İ': 'I',
        'ö': 'o',
        'Ö': 'O',
        'ş': 's',
        'Ş': 'S',
        'ü': 'u',
        'Ü': 'U'
    };
    return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, match => charMapping[match] || match);
}
