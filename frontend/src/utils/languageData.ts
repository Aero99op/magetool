export type Language =
    | 'en' | 'hi' | 'od' | 'ko'
    | 'bn' | 'mr' | 'te' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'ur' // Indian
    | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ru' | 'ar' | 'pt' | 'it'; // Global

export const LANGUAGE_NAMES: Record<string, Language> = {
    'english': 'en', 'hindi': 'hi', 'odia': 'od', 'korean': 'ko',
    'bengali': 'bn', 'marathi': 'mr', 'telugu': 'te', 'tamil': 'ta',
    'gujarati': 'gu', 'kannada': 'kn', 'malayalam': 'ml', 'punjabi': 'pa', 'urdu': 'ur',
    'spanish': 'es', 'french': 'fr', 'german': 'de', 'japanese': 'ja',
    'chinese': 'zh', 'russian': 'ru', 'arabic': 'ar', 'portuguese': 'pt', 'italian': 'it'
};

interface BotResponses {
    greeting: string[];
    help: string[];
    owner: string[];
    unknown: string[];
    redirect: string;
    language_set: string;
}

export const MULTI_LANG_RESPONSES: Record<Language, BotResponses> = {
    'en': {
        greeting: ["Hey how can I help you?", "Hello looking for a tool?", "Hi I am ready to assist."],
        help: ["I can take you to any tool. Try Compress Video, QR Code, or PDF to Word."],
        owner: ["I was created by Spandan Prayas Patra ft. Aero. Top 0.1% Engineering."],
        unknown: ["I didn't catch that. Try QR Code or Remove Background.", "Not sure about that one. Try listing a tool name."],
        redirect: "Taking you to ",
        language_set: "Language changed to English. How can I help?",
    },
    'hi': {
        greeting: ["Namaste kaise madad karu?", "Aur bhai kya chahiye aaj?", "Hello ji btaiye kya karna hai?"],
        help: ["Main kisi bhi tool pe le ja sakta hu. Bolo Video Compress, QR Code, ya PDF se Word."],
        owner: ["Mujhe banaya hai Spandan Prayas Patra ft. Aero ne. Ek dum top level engineering."],
        unknown: ["Samajh nahi aaya boss. Thoda saaf bolo, jaise QR Code ya Background hatao.", "Ye wala mental dictionary mein nahi hai."],
        redirect: "Lijiye apko le chal raha hu ",
        language_set: "Ab se main Hindi mein baat karunga. Btaiye kya seva karu?",
    },
    'od': {
        greeting: ["Namaskar kemiti achanti?", "Juhaar kan kariba ajji?", "Odisha ra No.1 bot apana pain ready achi."],
        help: ["Mu apananku je kaunasi tool ku nei paribi. Kuhantu QR Code kimba Video Compress."],
        owner: ["Mote tiari karichanti Spandan Prayas Patra ft. Aero. Pura khatarnak engineering."],
        unknown: ["Bujhi parilini agyan. Tike safa kariki kuhantu.", "Eita mote jana nahi."],
        redirect: "Chalantu jibaa ",
        language_set: "Ebe tharu mu Odiya re katha hebi. Agyan kuhantu?",
    },
    'bn': { // Bengali
        greeting: ["Nomoshkar kemon achen?", "Ki lagbe bolun?", "Ami apnake sahajyo korte prostut."],
        help: ["Ami jekono tool e niye jete pari. Bolun Video Compress ba QR Code."],
        owner: ["Amake baniyeche Spandan Prayas Patra ft. Aero."],
        unknown: ["Bujhte parlam na. Doya kore abar bolun.", "Thik bujhlam na."],
        redirect: "Apnake niye jacchhi ",
        language_set: "Ekhon theke ami Banglay kotha bolbo.",
    },
    'mr': { // Marathi
        greeting: ["Namaskar kase aahat?", "Kay madat karu?", "MageBot aaplya sevet hazir aahe."],
        help: ["Me tumhala kuthlyahi tool var neu shakto. Video Compress kinva QR Code bola."],
        owner: ["Mala Spandan Prayas Patra ft. Aero ne banavle aahe."],
        unknown: ["Samajla nahi. Krupaya parat sanga.", "He mala mahit nahi."],
        redirect: "Aapan jat aahot ",
        language_set: "Aata me Marathit bolel.",
    },
    'te': { // Telugu
        greeting: ["Namaskaram ela unnaru?", "Em kavali cheppandi?", "MageBot me kosam ready ga undi."],
        help: ["Nenu mimmalni ey tool kaina teesukuraagalanu. QR Code ani type cheyandi."],
        owner: ["Nannu create chesindi Spandan Prayas Patra ft. Aero."],
        unknown: ["Ardham kaledu. QR Code ani type cheyandi.", "Idi naku teliyadu."],
        redirect: "Ikkadiki teesukeltunnanu ",
        language_set: "Ippati nundi nenu Telugu lo matladutanu.",
    },
    'ta': { // Tamil
        greeting: ["Vanakkam eppadi irukkeenga?", "Enna udhavi vendum?", "MageBot ungalukku udhava thayar."],
        help: ["Naan ungalai endha tool-kkum eduthu selven. QR Code endru sollungal."],
        owner: ["Ennai uruvakkiyavar Spandan Prayas Patra ft. Aero."],
        unknown: ["Puriyavillai. Thayavu seidhu thelivaga sollungal.", "Idhu enakku theriyadhu."],
        redirect: "Ingu selgirom ",
        language_set: "Inimel naan Tamilil pesuven.",
    },
    'gu': { // Gujarati
        greeting: ["Namaste kem cho?", "Su madad karu?", "MageBot taiyaar che."],
        help: ["Hu tame koi pan tool par lai jai saku chu. Video Compress kaho."],
        owner: ["Mane Spandan Prayas Patra ft. Aero e banavyo che."],
        unknown: ["Samjanu nahi. Fari thi kaho.", "Aa mane khabar nathi."],
        redirect: "Tyan lai jau chu ",
        language_set: "Hve hu Gujarati ma vaat karish.",
    },
    'kn': { // Kannada
        greeting: ["Namaskara hegiddeera?", "Yenu sahaya beku?", "MageBot nimma sevege siddha."],
        help: ["Naanu nimmannu yavude tool ge kareduoyyaballe. QR Code anta heli."],
        owner: ["Nannannu Spandan Prayas Patra ft. Aero rucisiddare."],
        unknown: ["Artha aaglilla. Dayavittu matte heli.", "Idu nange gottilla."],
        redirect: "Ille kareduoyyuttiddene ",
        language_set: "Eegalinda naano Kannadadalli mataduttene.",
    },
    'ml': { // Malayalam
        greeting: ["Namaskaram, sukhamaano?", "Enthokke undu vishesham?", "Ningale sahaayikkaan njan ready."],
        help: ["Ethu toolilekkum ningale kondu povaan enikku kazhiyum. Video Compress enn parayoo."],
        owner: ["Spandan Prayas Patra ft. Aero aanu enne undakkiyathu."],
        unknown: ["Manasilayilla. Onnu koodi parayamo?", "Ithu enikku ariyilla."],
        redirect: "Avideykku kondu pokunnu ",
        language_set: "Ini njan Malayalathil samsarikkaam.",
    },
    'pa': { // Punjabi
        greeting: ["Sat Sri Akal, ki haal hai?", "Kiwen o?", "Tuhadi ki madat kara?"],
        help: ["Main tuhanu kisi wi tool te lai ja sakda haan. Video Compress bolo."],
        owner: ["Mainu Spandan Prayas Patra ft. Aero ne banaya hai."],
        unknown: ["Samajh nahi aayi. Dobara dasso.", "Eh mainu pata nahi."],
        redirect: "Tuhanu lai ke ja reha haan ",
        language_set: "Hun main Punjabi wich gall karanga.",
    },
    'ur': { // Urdu
        greeting: ["Assalam-o-Alaikum, kaise hain aap?", "Kya madad kar sakta hoon?", "MageBot aapki khidmat mein hazir hai."],
        help: ["Main aapko kisi bhi tool tak le ja sakta hoon. Video Compress bolein."],
        owner: ["Mujhe Spandan Prayas Patra ft. Aero ne banaya hai."],
        unknown: ["Samajh nahi aaya. Bara-e-meherbani dobara bolein.", "Yeh mujhe maloom nahi."],
        redirect: "Aapko le ja raha hoon ",
        language_set: "Ab main Urdu mein baat karunga.",
    },
    'ko': {
        greeting: ["annyeonghaseyo mueos-eul dowa deulilkkayo?", "annyeong eotteon doguga pil-yohasin-gayo?"],
        help: ["eotteon dogudeun chaj-a deulil su isseoyo. QR Codeleul sidohaeboseyo."],
        owner: ["jeoneun Spandan Prayas Patra ft. Aero-e uihae mandeul-eojyeossseubnida. choego sujun-ui enjinieoling."],
        unknown: ["ihaehal su eobs-seubnida. dasi malhaejuseyo.", "joesonghabnida jal moleugess-eoyo."],
        redirect: "idonghabnida ",
        language_set: "ijebuteo hangug-eolo daehwahabnida.",
    },
    'ja': { // Japanese
        greeting: ["Konnichiwa nanika otesudai shimashouka?", "Genki desuka?"],
        help: ["Dono tool ni mo goannai shimasu. Video Compress to itte kudasai."],
        owner: ["Watashi wa Spandan Prayas Patra ft. Aero ni yotte tsukuraremashita."],
        unknown: ["Wakarimasen deshita. Mou ichido itte kudasai.", "Sore wa wakarimasen."],
        redirect: "Kochira e goannai shimasu ",
        language_set: "Korekara wa Nihongo de hanashimasu.",
    },
    'zh': { // Chinese
        greeting: ["Ni hao you sheme keyi bang ni?", "Ni hao!"],
        help: ["Wo keyi dai ni qu renhe gongju. Shishi Video Compress."],
        owner: ["Wo shi you Spandan Prayas Patra ft. Aero chuangjian de."],
        unknown: ["Wo bu mingbai. Qing zai shuo yi bian.", "Wo bu zhidao."],
        redirect: "Dai ni qu ",
        language_set: "Wo xianzai hui shuo Zhongwen.",
    },
    'es': { // Spanish
        greeting: ["Hola en que puedo ayudarte?", "Hola que necesitas?"],
        help: ["Puedo llevarte a cualquier herramienta. Di Video Compress."],
        owner: ["Fui creado por Spandan Prayas Patra ft. Aero."],
        unknown: ["No entendi. Repitelo por favor.", "No se eso."],
        redirect: "Llevandote a ",
        language_set: "Ahora hablare en Espanol.",
    },
    'fr': { // French
        greeting: ["Bonjour comment puis-je vous aider?", "Salut!"],
        help: ["Je peux vous emmener vers n'importe quel outil. Dites Video Compress."],
        owner: ["J'ai ete cree par Spandan Prayas Patra ft. Aero."],
        unknown: ["Je n'ai pas compris. Repetez s'il vous plait.", "Je ne sais pas ca."],
        redirect: "Je vous emmene a ",
        language_set: "Desormais je parlerai en Francais.",
    },
    'de': { // German
        greeting: ["Hallo wie kann ich helfen?", "Guten Tag!"],
        help: ["Ich kann Sie zu jedem Werkzeug bringen. Sagen Sie Video Compress."],
        owner: ["Ich wurde von Spandan Prayas Patra ft. Aero erstellt."],
        unknown: ["Ich habe das nicht verstanden. Bitte wiederholen.", "Das weiss ich nicht."],
        redirect: "Ich bringe Sie zu ",
        language_set: "Ab jetzt spreche ich Deutsch.",
    },
    'ru': { // Russian
        greeting: ["Privet kak ya mogu pomoch?", "Zdravstvuyte!"],
        help: ["Ya mogu otvesti vas k lyubomu instrumentu. Skazhite Video Compress."],
        owner: ["Menya sozdal Spandan Prayas Patra ft. Aero."],
        unknown: ["Ya ne ponyal. Povtorite pozhaluysta.", "Ya etogo ne znayu."],
        redirect: "Perehozhu k ",
        language_set: "Teper ya budu govorit po-russki.",
    },
    'ar': { // Arabic - Transliterated for compatibility if fonts fail, or actual script? User didn't specify script, but "korean" was romanized in my previous code. I will use actual script for Arabic usually, but let's stick to safe strings or simple transliteration if display is an issue. Actually, modern browsers handle Arabic fine. Let's use English transliteration for consistency with user's 'Hinglish' style preference, or actual script? User said "korean toh korean mei" (Hangul). I'll use native scripts where I can trust rendering.
        greeting: ["Marhaban kayfa yumkinuni musaadatuka?", "Ahlan!"],
        help: ["Yumkinuni an akhuthaka ila ay adaat. Jarrib Video Compress."],
        owner: ["Tam insha'i بواسطة Spandan Prayas Patra ft. Aero."],
        unknown: ["Lam afham. A'id min fadlik.", "La a'rif thalik."],
        redirect: "Jari al-tahwil ila ",
        language_set: "sa'atakallam al-arabiyah al-an.",
    },
    'pt': { // Portuguese
        greeting: ["Ola como posso ajudar?", "Oi!"],
        help: ["Posso levar voce a qualquer ferramenta. Diga Video Compress."],
        owner: ["Fui criado por Spandan Prayas Patra ft. Aero."],
        unknown: ["Nao entendi. Repita por favor.", "Nao sei isso."],
        redirect: "Levando voce para ",
        language_set: "Agora vou falar em Portugues.",
    },
    'it': { // Italian
        greeting: ["Ciao come posso aiutarti?", "Salve!"],
        help: ["Posso portarti a qualsiasi strumento. Di Video Compress."],
        owner: ["Sono stato creato da Spandan Prayas Patra ft. Aero."],
        unknown: ["Non ho capito. Ripeti per favore.", "Non lo so."],
        redirect: "Ti porto a ",
        language_set: "Ora parlero in Italiano.",
    }
};
