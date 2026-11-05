import { Country } from '../types/game';

// SVG flags for 8 fictional countries
export const COUNTRY_FLAGS: Record<string, string> = {
  arven: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#0b1b3d"/>
    <path d="M0 40 L120 40" stroke="#00f5d4" stroke-width="12"/>
    <path d="M0 40 L120 40" stroke="#ffd166" stroke-width="4"/>
    <circle cx="60" cy="40" r="16" fill="#0b1b3d" stroke="#ffd166" stroke-width="3"/>
    <polygon points="60,28 63,36 71,36 65,41 67,49 60,44 53,49 55,41 49,36 57,36" fill="#00f5d4"/>
  </svg>`,
  kaldor: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#1e293b"/>
    <polygon points="0,0 120,80 0,80" fill="#0284c7"/>
    <path d="M20,40 L100,40 M60,10 L60,70" stroke="#f8fafc" stroke-width="6"/>
    <circle cx="60" cy="40" r="8" fill="#38bdf8"/>
  </svg>`,
  sahran: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#78350f"/>
    <rect y="26" width="120" height="28" fill="#f59e0b"/>
    <rect y="54" width="120" height="26" fill="#065f46"/>
    <path d="M45,40 A15,15 0 1,0 65,25 A12,12 0 1,1 45,40" fill="#fef3c7"/>
    <polygon points="68,36 72,32 76,36 72,40" fill="#fef3c7"/>
  </svg>`,
  veloria: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#0f172a"/>
    <path d="M0 0 L120 80 M0 80 L120 0" stroke="#9333ea" stroke-width="10"/>
    <circle cx="60" cy="40" r="18" fill="#1e1b4b" stroke="#c084fc" stroke-width="4"/>
    <circle cx="60" cy="40" r="8" fill="#f43f5e"/>
  </svg>`,
  dravik: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#450a0a"/>
    <polygon points="0,80 60,15 120,80" fill="#991b1b"/>
    <circle cx="60" cy="50" r="14" fill="#fbbf24"/>
    <polygon points="60,40 64,48 72,48 66,54 68,62 60,57 52,62 54,54 48,48 56,48" fill="#450a0a"/>
  </svg>`,
  nemer: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#064e3b"/>
    <rect width="40" height="80" fill="#065f46"/>
    <rect x="80" width="40" height="80" fill="#047857"/>
    <circle cx="60" cy="40" r="14" fill="#ecfdf5"/>
    <path d="M60 28 L60 52 M48 40 L72 40" stroke="#10b981" stroke-width="4"/>
  </svg>`,
  ordan: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#292524"/>
    <polygon points="0,0 60,40 0,80" fill="#d97706"/>
    <polygon points="120,0 60,40 120,80" fill="#b45309"/>
    <rect x="50" y="25" width="20" height="30" fill="#fde68a" rx="2"/>
  </svg>`,
  tazira: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" class="w-full h-full shadow-inner">
    <rect width="120" height="80" fill="#0c4a6e"/>
    <path d="M0 20 Q 30 10, 60 20 T 120 20 L 120 80 L 0 80 Z" fill="#0369a1"/>
    <circle cx="60" cy="25" r="10" fill="#38bdf8"/>
    <polygon points="50,60 60,45 70,60" fill="#e0f2fe"/>
  </svg>`
};

export const INITIAL_COUNTRIES: Record<string, Country> = {
  arven: {
    id: 'arven',
    nameKu: 'کۆماری ئارڤێن',
    nameEn: 'Arven Republic',
    flagSvg: COUNTRY_FLAGS.arven,
    leaderKu: 'سەرۆک کۆمار (ئێوە)',
    leaderEn: 'President (You)',
    leaderTitleKu: 'سەرۆک کۆماری هەڵبژێردراو',
    governmentKu: 'کۆماری دیموکراسی پەرلەمانی',
    governmentEn: 'Parliamentary Democratic Republic',
    ideology: 'Democratic',
    capitalKu: 'وەیرا (Veyra)',
    capitalEn: 'Veyra',
    cities: [
      { nameKu: 'وەیرا', nameEn: 'Veyra', population: '٤.٢ ملیۆن', roleKu: 'پایتەختی سیاسی و ناوەندی دەسەڵات' },
      { nameKu: 'لۆریان', nameEn: 'Lorian', population: '٢.٨ ملیۆن', roleKu: 'گەورەترین بەندەری بازرگانی و کەشتیگەل' },
      { nameKu: 'مێرۆس', nameEn: 'Meros', population: '١.٦ ملیۆن', roleKu: 'شارە پیشەسازییە قورسەکان و تەکنەلۆژیا' }
    ],
    gdpBillions: 480,
    militaryPower: 68,
    militaryReadiness: 65,
    relationsWithArven: 100,
    tradeStatusKu: 'ناوەندی بازرگانی نیشتمانی',
    activeTreaties: ['پەیمانی بەرگری دەریایی لۆریان'],
    interestsKu: ['پاراستنی دیموکراسی', 'سەروەریی خاکی', 'کۆنتڕۆڵکردنی هەڵئاوسان', 'ئاسایشی وزە'],
    bioKu: 'کۆمارێکی دەستووری کە لە سەردەمی گواستنەوەی هاوپەیمانیدایە. هاوسەنگی نێوان دەسەڵاتی دەریایی و پیشەسازی دەپارێزێت.',
    mapCoords: { x: 50, y: 52, labelX: 50, labelY: 48 }
  },
  kaldor: {
    id: 'kaldor',
    nameKu: 'یەکێتیی کالدۆر',
    nameEn: 'Kaldor Union',
    flagSvg: COUNTRY_FLAGS.kaldor,
    leaderKu: 'ڕاوێژکار هێلێنا ڤان ڕۆن',
    leaderEn: 'Chancellor Helena Van Ron',
    leaderTitleKu: 'ڕاوێژکاری فیدراڵی کالدۆر',
    governmentKu: 'یەکێتیی تەکنۆکرات و فیدراڵ',
    governmentEn: 'Federal Technocracy',
    ideology: 'Federal',
    capitalKu: 'نۆردمارک (Nordmark)',
    capitalEn: 'Nordmark',
    cities: [
      { nameKu: 'نۆردمارک', nameEn: 'Nordmark', population: '٥.١ ملیۆن', roleKu: 'پایتەختی دارایی و پەرلەمانی باکوور' },
      { nameKu: 'هالێن', nameEn: 'Halen', population: '٣.٤ ملیۆن', roleKu: 'ناوەندی تەکنەلۆژیای پێشکەوتوو و داهێنان' },
      { nameKu: 'ڤۆست', nameEn: 'Vost', population: '٢.١ ملیۆن', roleKu: 'بەندەری بەستەڵەک و بنکەی دەریاوانی' }
    ],
    gdpBillions: 720,
    militaryPower: 82,
    militaryReadiness: 75,
    relationsWithArven: 45, // Neutral-positive, seeks trade deal
    tradeStatusKu: 'گفتوگۆی پەیماننامەی ئازادی بازرگانی',
    activeTreaties: [],
    interestsKu: ['کردنەوەی بەندەرەکانی باشوور', 'پەرەپێدانی تەکنەلۆژیا', 'کۆنتڕۆڵی ڕێڕەوەکانی باکوور'],
    bioKu: 'زلھێزێکی باکووری کە خاوەنی سەرمایەیەکی گەورە و تەکنەلۆژیای پیشەسازییە. بەدوای کردنەوەی بازاڕی ئارڤێندا دەگەڕێت.',
    mapCoords: { x: 48, y: 16, labelX: 48, labelY: 12 }
  },
  sahran: {
    id: 'sahran',
    nameKu: 'میرنشینەکانی سەحران',
    nameEn: 'Sahran Emirates',
    flagSvg: COUNTRY_FLAGS.sahran,
    leaderKu: 'ئەمیر ڕەشید ئال سوباح',
    leaderEn: 'Emir Rashid Al-Sabah',
    leaderTitleKu: 'ئەمیری باڵای سەحران',
    governmentKu: 'فیدراسیۆنی میرنشینە پادشاییەکان',
    governmentEn: 'Dynastic Federation',
    ideology: 'Monarchic',
    capitalKu: 'قەسیرە (Qasira)',
    capitalEn: 'Qasira',
    cities: [
      { nameKu: 'قەسیرە', nameEn: 'Qasira', population: '٣.٨ ملیۆن', roleKu: 'پایتەختی زێڕین و ناوەندی بانکی' },
      { nameKu: 'نادر', nameEn: 'Nadir', population: '٢.٠ ملیۆن', roleKu: 'ناوەندی پاڵاوتن و کانزاکان' },
      { nameKu: 'ئەزڕەق', nameEn: 'Azraq', population: '١.٢ ملیۆن', roleKu: 'بەندەری کەنداوی نەوتی' }
    ],
    gdpBillions: 890,
    militaryPower: 70,
    militaryReadiness: 60,
    relationsWithArven: 30, // Transactional
    tradeStatusKu: 'هەناردەکاری سەرەکی سووتەمەنی',
    activeTreaties: ['ڕێککەوتنی گواستنەوەی دەریایی'],
    interestsKu: ['نرخی بەرزی نەوت و گاز', 'سەقامگیری کەنداو', 'کڕینی تەکنەلۆژیای کشتوکاڵی'],
    bioKu: 'دەوڵەمەندترین دەوڵەتی وزە لە ناوچەکەدا، سیاسەتێکی خۆپارێزانە و بازرگانییان هەیە بەڵام زۆر کاریگەرن لەسەر دارایی جیهانی.',
    mapCoords: { x: 12, y: 72, labelX: 12, labelY: 67 }
  },
  veloria: {
    id: 'veloria',
    nameKu: 'فیدراسیۆنی ڤێلۆریا',
    nameEn: 'Veloria Federation',
    flagSvg: COUNTRY_FLAGS.veloria,
    leaderKu: 'سەرۆک وەزیران ئاندرێ کالدیرۆن',
    leaderEn: 'Prime Minister Andre Calderon',
    leaderTitleKu: 'سەرۆکی ئەنجومەنی فیدراڵ',
    governmentKu: 'کۆماری بازرگانی لیبراڵ',
    governmentEn: 'Merchant Republic',
    ideology: 'Corporatist',
    capitalKu: 'بێلار (Bellar)',
    capitalEn: 'Bellar',
    cities: [
      { nameKu: 'بێلار', nameEn: 'Bellar', population: '٤.٥ ملیۆن', roleKu: 'بۆرسەی جیهانی و شارەوانی سەرەکی' },
      { nameKu: 'ئۆرسێن', nameEn: 'Orsen', population: '٢.٤ ملیۆن', roleKu: 'ناوەندی بازرگانی دەریایی' },
      { nameKu: 'کالدا', nameEn: 'Calda', population: '١.٨ ملیۆن', roleKu: 'دروستکردنی فڕۆکە و کەشتی' }
    ],
    gdpBillions: 610,
    militaryPower: 76,
    militaryReadiness: 70,
    relationsWithArven: 20, // Mild competitor
    tradeStatusKu: 'هاوبەشی بازرگانی باجدار',
    activeTreaties: [],
    interestsKu: ['ئازادی دەریایی', 'کەمکردنەوەی رێگرییە گومرگییەکان', 'باڵادەستی کەناراوەکان'],
    bioKu: 'دەوڵەتێکی دەریایی بەهێز کە بەرژەوەندییەکانی لە ڕکابەری بەندەری لۆریانی ئارڤێندایە بەڵام ئامادەیە بۆ ڕێککەوتنی ستراتیژی.',
    mapCoords: { x: 88, y: 72, labelX: 88, labelY: 68 }
  },
  dravik: {
    id: 'dravik',
    nameKu: 'شانشینی دراڤیک',
    nameEn: 'Dravik Kingdom',
    flagSvg: COUNTRY_FLAGS.dravik,
    leaderKu: 'پاشا ڤیکتۆر چوارەم دراڤۆن',
    leaderEn: 'King Viktor IV Dravon',
    leaderTitleKu: 'پاشای تاجی ئاسنین و چیاکان',
    governmentKu: 'پاشایەتی نیمچە-دەستووری سەربازی',
    governmentEn: 'Militaristic Monarchy',
    ideology: 'Autocratic',
    capitalKu: 'ئێدران (Edran)',
    capitalEn: 'Edran',
    cities: [
      { nameKu: 'ئێدران', nameEn: 'Edran', population: '٣.١ ملیۆن', roleKu: 'قەڵای پاشایەتی و سوارچاکان' },
      { nameKu: 'مۆرویک', nameEn: 'Morvik', population: '٢.٢ ملیۆن', roleKu: 'کانەکانی یۆرانیۆم و ئاسن' },
      { nameKu: 'تالێن', nameEn: 'Talen', population: '١.٣ ملیۆن', roleKu: 'شاری گەرووی شاخاوی و بەنداوی هایدرۆ' }
    ],
    gdpBillions: 390,
    militaryPower: 88,
    militaryReadiness: 90, // Aggressive
    relationsWithArven: -40, // Strained over energy & borders
    tradeStatusKu: 'سزای دیپلۆماسی و کێشەی هێڵی گاز',
    activeTreaties: [],
    interestsKu: ['دەسەڵات بەسەر گەرووە شاخاوییەکان', 'فرۆشتنی گازی بەنرخ', 'بەهێزکردنی سنوورەکانی باشوور'],
    bioKu: 'شانشینێکی سەربازی شاخاوی کە خاوەنی سۆپایەکی زۆر ڕێکخراو و بەهێزە. کێشەی وزەی سەرەکی ئارڤێن لەگەڵ ئەم وڵاتەدایە.',
    mapCoords: { x: 68, y: 28, labelX: 68, labelY: 24 }
  },
  nemer: {
    id: 'nemer',
    nameKu: 'کۆماری نێمەر',
    nameEn: 'Nemer Republic',
    flagSvg: COUNTRY_FLAGS.nemer,
    leaderKu: 'سەرۆک زەینەب کەمال',
    leaderEn: 'President Zeinab Kamal',
    leaderTitleKu: 'سەرۆک کۆماری گەلی نێمەر',
    governmentKu: 'کۆماری سۆسیال دیموکرات',
    governmentEn: 'Social Democratic Republic',
    ideology: 'Democratic',
    capitalKu: 'سالێن (Salen)',
    capitalEn: 'Salen',
    cities: [
      { nameKu: 'سالێن', nameEn: 'Salen', population: '٢.٩ ملیۆن', roleKu: 'ناوەندی زانکۆ و ڕۆشنبیری نەتەوەیی' },
      { nameKu: 'یارا', nameEn: 'Yara', population: '١.٧ ملیۆن', roleKu: 'دەشتی بەپیت و سەمبولی دانەوێڵە' },
      { nameKu: 'کەسرین', nameEn: 'Kesrin', population: '١.١ ملیۆن', roleKu: 'پیشەسازی خۆراک و دەرمان' }
    ],
    gdpBillions: 310,
    militaryPower: 50,
    militaryReadiness: 45,
    relationsWithArven: 55, // Friendly
    tradeStatusKu: 'پەیمانی دابینکردنی گەنم و خۆراک',
    activeTreaties: ['ڕێککەوتنی کشتوکاڵی سالێن'],
    interestsKu: ['پاراستنی ئاشتی هەرێمی', 'ئاسایشی خۆراک', 'پەرەپێدانی زانست و پزیشکی'],
    bioKu: 'دراوسێیەکی ئارام و زەمینەی کشتوکاڵی بەپیت. پشت بە هاوپەیمانی لەگەڵ ئارڤێن دەبەستێت بۆ پاراستنی خۆی لە دراڤیک.',
    mapCoords: { x: 86, y: 22, labelX: 86, labelY: 18 }
  },
  ordan: {
    id: 'ordan',
    nameKu: 'کۆنفیدراسیۆنی ئۆردان',
    nameEn: 'Ordan Confederation',
    flagSvg: COUNTRY_FLAGS.ordan,
    leaderKu: 'جەنەراڵ یۆرگن هاوک',
    leaderEn: 'General Jorgen Hauk',
    leaderTitleKu: 'سەرۆکی ئەنجومەنی فەرماندەکان',
    governmentKu: 'کۆنفیدراسیۆنی کانتۆنە سەربازییەکان',
    governmentEn: 'Military Canton Confederation',
    ideology: 'Autocratic',
    capitalKu: 'ئۆرێل (Orel)',
    capitalEn: 'Orel',
    cities: [
      { nameKu: 'ئۆرێل', nameEn: 'Orel', population: '٢.٢ ملیۆن', roleKu: 'قەڵای فەرماندەیی ناوەندی' },
      { nameKu: 'دەستار', nameEn: 'Dastar', population: '١.٥ ملیۆن', roleKu: 'کارگەکانی چەک و تەقەمەنی' },
      { nameKu: 'ڤێلێن', nameEn: 'Velen', population: '٩٠٠ هەزار', roleKu: 'شارۆچکەی پاڵاوگەی کانزایی' }
    ],
    gdpBillions: 260,
    militaryPower: 74,
    militaryReadiness: 80,
    relationsWithArven: -15, // Suspicious
    tradeStatusKu: 'هاوردەی سنوورداری کانزا',
    activeTreaties: [],
    interestsKu: ['کڕینی دراوی بیانی', 'هاوپەیمانی دژی دەسەڵاتە لیبراڵەکان', 'فراوانکردنی کانتۆنەکان'],
    bioKu: 'هاوپەیمانییەکی پچڕ پچڕ لە کانتۆنەکان کە بەرهەمهێنەری چەک و پۆڵان بەڵام سەقامگیری سیاسییان کەمە.',
    mapCoords: { x: 26, y: 44, labelX: 26, labelY: 40 }
  },
  tazira: {
    id: 'tazira',
    nameKu: 'کۆماری تازیرا',
    nameEn: 'Tazira Republic',
    flagSvg: COUNTRY_FLAGS.tazira,
    leaderKu: 'دادوەر سۆفیا کێن',
    leaderEn: 'Judge Sofia Ken',
    leaderTitleKu: 'سەرۆکی دیوانی دەوڵەتی تازیرا',
    governmentKu: 'کۆماری دەستووری تەکنەلۆژی',
    governmentEn: 'Constitutional Technocracy',
    ideology: 'Democratic',
    capitalKu: 'میران (Miran)',
    capitalEn: 'Miran',
    cities: [
      { nameKu: 'میران', nameEn: 'Miran', population: '٣.٤ ملیۆن', roleKu: 'ناوەندی سایبەر و سەرمایەی زانیاری' },
      { nameKu: 'سۆرێس', nameEn: 'Soreth', population: '١.٩ ملیۆن', roleKu: 'بەندەری هایدرۆجین و سووتەمەنی خاوێن' },
      { nameKu: 'دالان', nameEn: 'Dalan', population: '١.٢ ملیۆن', roleKu: 'دامەزراوەی هەواڵگری و رادار' }
    ],
    gdpBillions: 430,
    militaryPower: 62,
    militaryReadiness: 72,
    relationsWithArven: 10, // Cautious observer
    tradeStatusKu: 'ئاڵوگۆڕی داتای کەشناسی و بازرگانی',
    activeTreaties: [],
    interestsKu: ['ئاسایشی سایبەری جیهانی', 'بێلایەنی لە شەڕی زلھێزەکان', 'ڕێککەوتنی نێودەوڵەتی داتاکان'],
    bioKu: 'دەوڵەتێکی مۆدێرن و ژیر لەسەر کەناراوەکان کە لە بواری سایبەر و هەواڵگریدا ڕۆڵێکی ناهاوسەنگ دەگێڕێت.',
    mapCoords: { x: 8, y: 24, labelX: 8, labelY: 20 }
  }
};
