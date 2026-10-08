import type { ChatbotIntent } from './chatbot.intent';

// Reuse the existing lightweight Hindi/Marathi detection for local responses.
function languageOf(message: string): 'en' | 'hi' | 'mr' {
    if (!/[\u0900-\u097f]/u.test(message)) return 'en';
    return /आहे|काय|कसे|कोण|मला|आमच्या|तुमच्या|नोकरी|गुंतवणूक/u.test(message) ? 'mr' : 'hi';
}

const FALLBACKS: Record<ChatbotIntent, Record<'en' | 'hi' | 'mr', string>> = {
    ABOUT_SERVICES: {
        en: "I don't have verified information about Agrotourism Connect's services right now.",
        hi: 'मेरे पास अभी एग्रोटूरिज्म कनेक्ट की सेवाओं के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या अॅग्रोटुरिझम कनेक्टच्या सेवांबद्दल पडताळलेली माहिती नाही.',
    },
    PUBLIC_PROJECTS: {
        en: "I don't have verified information about current public projects right now.",
        hi: 'मेरे पास अभी वर्तमान सार्वजनिक परियोजनाओं के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या चालू सार्वजनिक प्रकल्पांबद्दल पडताळलेली माहिती नाही.',
    },
    INVESTMENT: {
        en: "I don't have verified information about current investment opportunities right now.",
        hi: 'मेरे पास अभी वर्तमान निवेश अवसरों के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या उपलब्ध गुंतवणुकीच्या संधींबद्दल पडताळलेली माहिती नाही.',
    },
    OWNER_FOUNDER: {
        en: "I don't have verified information about the owner right now.",
        hi: 'मेरे पास अभी मालिक के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या मालकाबद्दल पडताळलेली माहिती नाही.',
    },
    LOGIN_AUTH: {
        en: "I don't have verified information about the login or registration process right now.",
        hi: 'मेरे पास अभी लॉगिन या पंजीकरण प्रक्रिया के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या लॉगिन किंवा नोंदणी प्रक्रियेबद्दल पडताळलेली माहिती नाही.',
    },
    JOBS: {
        en: "I don't have verified information about current job openings right now.",
        hi: 'मेरे पास अभी वर्तमान नौकरी के अवसरों के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या उपलब्ध नोकऱ्यांबद्दल पडताळलेली माहिती नाही.',
    },
    PRICING: {
        en: "I don't have verified pricing information right now.",
        hi: 'मेरे पास अभी शुल्क के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या शुल्काबद्दल पडताळलेली माहिती नाही.',
    },
    CONTACT: {
        en: "I don't have verified contact information right now.",
        hi: 'मेरे पास अभी सत्यापित संपर्क जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या पडताळलेली संपर्क माहिती नाही.',
    },
    TRAINING: {
        en: "I don't have verified information about current training programs right now.",
        hi: 'मेरे पास अभी वर्तमान प्रशिक्षण कार्यक्रमों के बारे में सत्यापित जानकारी नहीं है।',
        mr: 'माझ्याकडे सध्या चालू प्रशिक्षण कार्यक्रमांबद्दल पडताळलेली माहिती नाही.',
    },
    GENERAL_TOURISM: {
        en: "I'm unable to provide a response right now. Please try again later.",
        hi: 'मैं अभी जवाब नहीं दे सकता। कृपया बाद में फिर कोशिश करें।',
        mr: 'मी सध्या उत्तर देऊ शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    },
    GENERAL: {
        en: "I'm unable to provide a response right now. Please try again later.",
        hi: 'मैं अभी जवाब नहीं दे सकता। कृपया बाद में फिर कोशिश करें।',
        mr: 'मी सध्या उत्तर देऊ शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    },
    UNKNOWN: {
        en: "I'm unable to provide a response right now. Please try again later.",
        hi: 'मैं अभी जवाब नहीं दे सकता। कृपया बाद में फिर कोशिश करें।',
        mr: 'मी सध्या उत्तर देऊ शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    },
};

export function intentFallback(message: string, intent: ChatbotIntent): string {
    return FALLBACKS[intent][languageOf(message)];
}
