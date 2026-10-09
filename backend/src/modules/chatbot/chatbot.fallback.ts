import type { ChatbotIntent } from './chatbot.intent';

function detectLanguage(
    message: string
): 'EN' | 'MR' | 'HI' {
    if (/[\u0900-\u097F]/u.test(message)) {
        // Marathi markers
        if (
            /मालक|काय|आहे|माझ|तुमच|इथे|प्रकल्प|सेवा|संपर्क|नोकरी|गुंतवणूक/u.test(
                message
            )
        ) {
            return 'MR';
        }

        // Otherwise treat Devanagari as Hindi
        return 'HI';
    }

    return 'EN';
}

export function intentFallback(
    message: string,
    intent: ChatbotIntent
): string {
    const language = detectLanguage(message);

    if (intent === 'GENERAL' || intent === 'UNKNOWN') {
        if (language === 'MR') return 'मी Agrotourism Connect AI Assistant आहे. कृपया या वेबसाइट, कृषी पर्यटन, पर्यटन विकास, प्रकल्प, गुंतवणूक, प्रशिक्षण किंवा Knowledge Center बद्दल विचारा.';
        if (language === 'HI') return 'मैं Agrotourism Connect AI Assistant हूँ। कृपया इस वेबसाइट, कृषि पर्यटन, पर्यटन विकास, परियोजनाओं, निवेश, प्रशिक्षण या Knowledge Center के बारे में पूछें।';
        return "I'm the Agrotourism Connect AI Assistant. I can help with this platform, agro tourism, tourism development, projects, investment, training, Knowledge Center and related enquiries.";
    }

    if (intent === 'KNOWLEDGE_CENTER' || intent === 'PLATFORM_FEATURES') {
        if (language === 'MR') return 'माझ्याकडे सध्या या वेबसाइट विभागाबद्दल सत्यापित माहिती उपलब्ध नाही.';
        if (language === 'HI') return 'मेरे पास अभी इस वेबसाइट अनुभाग के बारे में सत्यापित जानकारी उपलब्ध नहीं है।';
        return intent === 'KNOWLEDGE_CENTER'
            ? "I don't have verified Knowledge Center information right now."
            : "I don't have verified information about that website feature right now.";
    }

    // =====================================================
    // MARATHI
    // =====================================================

    if (language === 'MR') {
        switch (intent) {
            case 'ABOUT_SERVICES':
                return 'माझ्याकडे सध्या Agrotourism Connect च्या सेवांबद्दल सत्यापित माहिती उपलब्ध नाही.';

            case 'PUBLIC_PROJECTS':
                return 'माझ्याकडे सध्या सार्वजनिक प्रकल्पांची सत्यापित माहिती उपलब्ध नाही.';

            case 'INVESTMENT':
                return 'माझ्याकडे सध्या सत्यापित गुंतवणूक संधींची माहिती उपलब्ध नाही.';

            case 'OWNER_FOUNDER':
                return 'माझ्याकडे सध्या मालकाबद्दल सत्यापित माहिती उपलब्ध नाही.';

            case 'LOGIN_AUTH':
                return 'माझ्याकडे सध्या लॉगिन किंवा अकाउंट प्रवेशाबद्दल सत्यापित माहिती उपलब्ध नाही.';

            case 'JOBS':
                return 'माझ्याकडे सध्या नोकरीच्या उपलब्ध जागांबद्दल सत्यापित माहिती उपलब्ध नाही.';

            case 'PRICING':
                return 'माझ्याकडे सध्या सत्यापित किंमत किंवा शुल्काची माहिती उपलब्ध नाही.';

            case 'CONTACT':
                return 'माझ्याकडे सध्या सत्यापित संपर्क माहिती उपलब्ध नाही.';

            case 'TRAINING':
                return 'माझ्याकडे सध्या सत्यापित प्रशिक्षण माहिती उपलब्ध नाही.';

            case 'GENERAL_TOURISM':
                return 'मी सध्या त्या पर्यटन विषयावर उत्तर देऊ शकत नाही. कृपया पुन्हा प्रयत्न करा.';

            default:
                return 'माझ्याकडे सध्या त्या विषयाची सत्यापित माहिती उपलब्ध नाही.';
        }
    }

    // =====================================================
    // HINDI
    // =====================================================

    if (language === 'HI') {
        switch (intent) {
            case 'ABOUT_SERVICES':
                return 'मेरे पास अभी Agrotourism Connect की सेवाओं के बारे में सत्यापित जानकारी उपलब्ध नहीं है।';

            case 'PUBLIC_PROJECTS':
                return 'मेरे पास अभी सार्वजनिक प्रोजेक्ट्स की सत्यापित जानकारी उपलब्ध नहीं है।';

            case 'INVESTMENT':
                return 'मेरे पास अभी सत्यापित निवेश अवसरों की जानकारी उपलब्ध नहीं है।';

            case 'OWNER_FOUNDER':
                return 'मेरे पास अभी मालिक के बारे में सत्यापित जानकारी उपलब्ध नहीं है।';

            case 'LOGIN_AUTH':
                return 'मेरे पास अभी लॉगिन या अकाउंट एक्सेस की सत्यापित जानकारी उपलब्ध नहीं है।';

            case 'JOBS':
                return 'मेरे पास अभी उपलब्ध नौकरी की रिक्तियों की सत्यापित जानकारी नहीं है।';

            case 'PRICING':
                return 'मेरे पास अभी सत्यापित कीमत या शुल्क की जानकारी उपलब्ध नहीं है।';

            case 'CONTACT':
                return 'मेरे पास अभी सत्यापित संपर्क जानकारी उपलब्ध नहीं है।';

            case 'TRAINING':
                return 'मेरे पास अभी सत्यापित ट्रेनिंग जानकारी उपलब्ध नहीं है।';

            case 'GENERAL_TOURISM':
                return 'मैं अभी उस पर्यटन विषय का उत्तर नहीं दे सकता। कृपया फिर से प्रयास करें।';

            default:
                return 'मेरे पास अभी उस विषय की सत्यापित जानकारी उपलब्ध नहीं है।';
        }
    }

    // =====================================================
    // ENGLISH
    // =====================================================

    switch (intent) {
        case 'ABOUT_SERVICES':
            return "I don't have verified information about Agrotourism Connect's services right now.";

        case 'PUBLIC_PROJECTS':
            return "I don't have verified information about current public projects right now.";

        case 'INVESTMENT':
            return "I don't have verified investment opportunity information right now.";

        case 'OWNER_FOUNDER':
            return 'Verified owner or founder information is not currently available.';

        case 'LOGIN_AUTH':
            return 'Verified login or account information is not currently available.';

        case 'JOBS':
            return "I don't have verified information about current job openings right now.";

        case 'PRICING':
            return 'Verified pricing information is not currently available.';

        case 'CONTACT':
            return 'Verified contact information is not currently available.';

        case 'TRAINING':
            return 'Verified training information is not currently available.';

        case 'GENERAL_TOURISM':
            return 'I’m unable to provide a response right now. Please try again later.';

        default:
            return 'I could not find verified information for that request.';
    }
}

/**
 * Compatibility helper for code that only has an intent
 * and no original user message.
 */
export function getIntentFallback(
    intent: ChatbotIntent
): string {
    return intentFallback('', intent);
}
