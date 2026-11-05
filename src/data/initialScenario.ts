import {
  GameState,
  PoliticalParty,
  CityData,
  BillProposal,
  DecisionCard
} from '../types/game';
import { INITIAL_COUNTRIES } from './countriesData';
import { INITIAL_ADVISORS } from './advisorsData';

export const INITIAL_PARTIES: PoliticalParty[] = [
  {
    id: 'ada',
    nameKu: 'هاوپەیمانی دیموکراتی ئارڤێن (حکومەت)',
    nameEn: 'Arven Democratic Alliance',
    color: '#00f5d4',
    seats: 78,
    alignment: 'coalition',
    loyaltyToPresident: 90,
    ideologyKu: 'ناوەندڕەو، دیموکراسی دەستووری، سەروەری نیشتمانی'
  },
  {
    id: 'fcu',
    nameKu: 'یەکێتی مەدەنی ئازاد (هاوبەشی هاوپەیمانی)',
    nameEn: 'Free Civic Union',
    color: '#38bdf8',
    seats: 32,
    alignment: 'coalition',
    loyaltyToPresident: 65, // Fragile!
    ideologyKu: 'لیبراڵیزمی ئابووری، پەیوەندی بەهێز لەگەڵ کالدۆر، بازرگانی ئازاد'
  },
  {
    id: 'prp',
    nameKu: 'پارتی چاکسازی گەل (ئۆپۆزسیۆنی سەرەکی)',
    nameEn: 'People’s Reform Party',
    color: '#f43f5e',
    seats: 58,
    alignment: 'opposition',
    loyaltyToPresident: 30,
    ideologyKu: 'سۆسیال دیموکرات، دژە گەندەڵی، بیمەی کرێکاران، شەفافیەت'
  },
  {
    id: 'ssf',
    nameKu: 'بەرەی سەروەری و پۆڵا (ئۆپۆزسیۆنی ناسیۆنالیست)',
    nameEn: 'Sovereignty & Steel Front',
    color: '#eab308',
    seats: 22,
    alignment: 'opposition',
    loyaltyToPresident: 45,
    ideologyKu: 'ناسیۆنالیزمی توند، بەهێزکردنی سوپا، دژایەتی سازان لەگەڵ دراڤیک'
  },
  {
    id: 'gel',
    nameKu: 'کۆمەڵەی زەوی سەوز (بێلایەن)',
    nameEn: 'Green Earth League',
    color: '#10b981',
    seats: 10,
    alignment: 'neutral',
    loyaltyToPresident: 50,
    ideologyKu: 'پاراستنی ژینگە، وزەی خاوێن، دژایەتی هێڵی گازی کۆن'
  }
];

export const INITIAL_CITIES: Record<string, CityData> = {
  veyra: {
    id: 'veyra',
    nameKu: 'وەیرا (Veyra)',
    nameEn: 'Veyra (Capital)',
    image: '/assets/03-capital-city.png',
    population: '٤.٢ ملیۆن کەس',
    specialtyKu: 'ناوەندی کۆشکی سەرۆکایەتی، پەرلەمان، زانکۆ و بانکی ناوەندی',
    growthRate: 2.4,
    unemployment: 6.2,
    infrastructureLevel: 75,
    activeProjects: ['مۆدێرنکردنی تۆڕی کارەبای پایتەخت', 'بەستنەوەی میترۆی خێرا بە لۆریان']
  },
  lorian: {
    id: 'lorian',
    nameKu: 'لۆریان (Lorian)',
    nameEn: 'Lorian (Port City)',
    image: '/assets/04-second-city.png',
    population: '٢.٨ ملیۆن کەس',
    specialtyKu: 'شاری کەناراو، بەندەری نێودەوڵەتی، پێشوازی لە کەشتییە نەوتهەڵگرەکان',
    growthRate: 3.1,
    unemployment: 8.5,
    infrastructureLevel: 68,
    activeProjects: ['قۆناغی دووەمی بەندەری قووڵی بازرگانی', 'سەکۆی هەناردەی گازی شل (LNG)']
  },
  meros: {
    id: 'meros',
    nameKu: 'مێرۆس (Meros)',
    nameEn: 'Meros (Industrial Hub)',
    image: '/assets/04-second-city.png',
    population: '١.٦ ملیۆن کەس',
    specialtyKu: 'دڵی پیشەسازی قورس، کارگەکانی پۆڵا، کۆمەڵگەی ئەلیکترۆنیات',
    growthRate: 1.8,
    unemployment: 7.9,
    infrastructureLevel: 60,
    activeProjects: ['پارکی پیشەسازی هایدرۆجین', 'نۆژەنکردنەوەی کارگەی چەکی بەرگری']
  }
};

export const INITIAL_BILLS: BillProposal[] = [
  {
    id: 'energy-act',
    titleKu: 'یاسای فریاگوزاری سەربەخۆیی وزە (٢٠٢٦)',
    titleEn: 'National Energy Independence Act',
    summaryKu: 'تەرخانکردنی ٦ ملیار دۆلار لە خەزێنە بۆ دروستکردنی وێستگەکانی وزەی خۆر و هایدرۆجین لە لۆریان و مێرۆس، بۆ رزگاربوون لە فشاری دراڤیک.',
    category: 'economy',
    supportBreakdown: { for: 108, against: 82, abstain: 10 },
    consequencesKu: {
      passed: 'ئاسایشی وزە بەرز دەبێتەوە و لە داهاتوودا هەڵئاوسانی گاز لەناو دەبات.',
      failed: 'بەردەوامی پشتبەستن بە دراڤیک و لاوازی دەوڵەت لە زستاندا.'
    },
    effectsOnPass: {
      treasuryBillion: -6,
      energyReservesPct: 18,
      infrastructureIndex: 8,
      publicApprovalPct: 5
    },
    status: 'pending'
  },
  {
    id: 'defense-readiness-act',
    titleKu: 'یاسای بەهێزکردنی سوپا و پاراستنی سنوورەکانی باکوور',
    titleEn: 'Northern Border Defense Act',
    summaryKu: 'کڕینی سیستەمی راداری نوێ و فڕۆکەی بێفڕۆکەوان، زیادکردنی مووچەی هێزەکانی زرێپۆش بە پێشنیاری ژەنەڕاڵ دارۆک ساڤێن.',
    category: 'security',
    supportBreakdown: { for: 122, against: 68, abstain: 10 },
    consequencesKu: {
      passed: 'ئامادەیی سەربازی بەرز دەبێتەوە، دراڤیک سڵ دەکاتەوە، بەڵام قەرز زیاد دەکات.',
      failed: 'لاوازی بەرگری ئارڤێن و توڕەبوونی سوپاسالار دارۆک.'
    },
    effectsOnPass: {
      treasuryBillion: -4.5,
      debtBillion: 3,
      militaryReadinessPct: 15,
      governmentStabilityPct: 4
    },
    status: 'pending'
  },
  {
    id: 'press-freedom-charter',
    titleKu: 'پەیماننامەی پاراستنی ئازادی رۆژنامەگەری و شەفافیەتی دارایی',
    titleEn: 'Press Freedom & Transparency Charter',
    summaryKu: 'یاسایەکی پێشنیارکراو لەلایەن میرا سۆلێن بۆ قەدەغەکردنی سانسۆر لەسەر گرێبەستە حکومییەکان و دانانی کۆمیسیۆنی لێکۆڵینەوە لە گەندەڵی.',
    category: 'welfare',
    supportBreakdown: { for: 94, against: 98, abstain: 8 },
    consequencesKu: {
      passed: 'ئازادی راگەیاندن و متمانەی گەنجان بەرز دەبێتەوە، ئۆپۆزسیۆن هێور دەبێتەوە.',
      failed: 'رەخنەی نێودەوڵەتی لە دۆخی دیموکراسی و ئەگەری خۆپیشاندانی خوێندکاران.'
    },
    effectsOnPass: {
      pressFreedomPct: 18,
      publicApprovalPct: 6,
      governmentStabilityPct: -3
    },
    status: 'pending'
  }
];

export const INITIAL_DECISIONS: DecisionCard[] = [
  {
    id: 'dec-turn1-dravik-gas',
    turnAvailable: 1,
    titleKu: 'قەیرانی گازی باکوور: هەڕەشەی پاشا ڤیکتۆری دراڤیک',
    titleEn: 'The Northern Gas Crisis: King Viktor’s Threat',
    sourceKu: 'وەزارەتی وزە و هەواڵگری نیشتمانی (DNI)',
    briefKu: 'پاشا ڤیکتۆری دراڤیک داوای ٥ ملیار دۆلار باجی گواستنەوەی نوێ دەکات بۆ هێڵی گازی باکوور، ئەگینا هەڕەشەی داخستنی دەمەوانەی گاز دەکات لەم هەفتەیەدا. خەزێنەی ئارڤێن بەم بارودۆخە دەهەژێت و یەدەگی وزە تەنها ٤٨٪ـە.',
    category: 'crisis',
    isMandatory: true,
    options: [
      {
        id: 'opt-dravik-pay',
        textKu: 'باجەکە بدەن بە تەواوی (٥ ملیار دۆلار) بۆ ئەوەی زستان بەبێ ساردی تێپەڕێت.',
        textEn: 'Pay the $5B demanded transit tariff to secure energy supply.',
        immediateEffects: {
          treasuryBillion: -5,
          energyReservesPct: 12,
          publicApprovalPct: -4,
          governmentStabilityPct: -3
        },
        relationEffects: { dravik: 15 },
        advisorReactions: {
          nara: 'oppose',
          darok: 'oppose',
          rayan: 'support',
          lina: 'neutral',
          mira: 'oppose'
        },
        rationaleKu: 'نارا ڤێل دەڵێت ئەمە خەزێنە بەتاڵ دەکات، ژەنەڕاڵ دارۆک بە سەرشۆڕیی نیشتمانی دەزانێت، بەڵام ڕایان دەروان پێیوایە بەرگری لە تاریکی شارەکان دەکات.',
        delayedConsequence: {
          triggerTurn: 3,
          headlineKu: 'دراڤیک داواکاری نوێی پارە بەرز دەکاتەوە بەهۆی سازانی پێشووی سەرۆکەوە!',
          descriptionKu: 'چونکە لە وەزری ڕابردوودا بەبێ مەرج باجەکەتان دا، پاشا ڤیکتۆر وای لێکدایەوە کە ئارڤێن لاوازە و داوای فرۆشتنی پشکی بەندەری لۆریانیش دەکات.',
          statEffects: {
            publicApprovalPct: -6,
            governmentStabilityPct: -5,
            inflationPct: 1.5
          },
          relationEffects: { dravik: -10 }
        }
      },
      {
        id: 'opt-dravik-military',
        textKu: 'رەتی بکەنەوە و دەستبەجێ تیپی ٤ی زرێپۆش بە سەرپەرشتی ژەنەڕاڵ دارۆک بنێرنە سنووری باکوور.',
        textEn: 'Refuse payment and deploy armored divisions to secure the frontier.',
        immediateEffects: {
          militaryReadinessPct: 14,
          energyReservesPct: -15,
          publicApprovalPct: 3,
          governmentStabilityPct: 4,
          treasuryBillion: -1.5
        },
        relationEffects: { dravik: -35 },
        advisorReactions: {
          darok: 'support',
          sami: 'support',
          nara: 'neutral',
          lina: 'oppose',
          rayan: 'oppose'
        },
        rationaleKu: 'ژەنەڕاڵ دارۆک دەڵێت تەنها لە زمانی زرێپۆش تێدەگەن؛ لینا ترسی لێکەوتنەوەی شەڕی گشتگیری هەیە.',
        delayedConsequence: {
          triggerTurn: 3,
          headlineKu: 'دراڤیک بۆری سەرەکی گازی داخست؛ پچڕانی کارەبا لە شارە پیشەسازییەکان!',
          descriptionKu: 'لە وەڵامی جوڵەی زرێپۆشەکانتاندا، دراڤیک بۆرییەکەی کوژاندەوە. کارگەکانی مێرۆس تووشی کێشە بوون، بەڵام ناسیۆنالیستەکان لە پەرلەمان ستایشی هێزتان دەکەن.',
          statEffects: {
            inflationPct: 2.2,
            gdpGrowthPct: -1.2,
            energyReservesPct: -10,
            publicApprovalPct: -3
          },
          relationEffects: { dravik: -15, ordan: 10 }
        }
      },
      {
        id: 'opt-dravik-lng-sahran',
        textKu: 'رێککەوتنی فریاگوزاری کڕینی گازی شل لەگەڵ میرنشینەکانی سەحران واژۆ بکەن و بەندەری لۆریان بەکاربهێنن.',
        textEn: 'Sign emergency LNG import contract with Sahran Emirates via Lorian port.',
        immediateEffects: {
          treasuryBillion: -4,
          energyReservesPct: 15,
          publicApprovalPct: 5,
          inflationPct: 0.8
        },
        relationEffects: { sahran: 25, dravik: -10 },
        advisorReactions: {
          lina: 'support',
          rayan: 'support',
          nara: 'neutral',
          darok: 'neutral',
          mira: 'support'
        },
        rationaleKu: 'لینا ئاراز بە سەروەری وزەی دەزانێت و سەحران بە هاوبەشی جێگیر دەنرخێنێت، گەرچی لە کورتخایەندا کرێی گواستنەوەی کەشتییەکان خەرجی هەیە.',
        delayedConsequence: {
          triggerTurn: 4,
          headlineKu: 'بەندەری لۆریان بووە ناوەندی نوێی بازرگانی هایدرۆکاربۆن لەگەڵ سەحران!',
          descriptionKu: 'کەشتییە گەورەکانی سەحران بە سەرکەوتوویی لە لۆریان لەنگەریان گرت، ئاسایشی وزەی دەوڵەت جێگیر بوو و بەردەوامی کێشەی دراڤیک بێکاریگەر کرا.',
          statEffects: {
            gdpGrowthPct: 1.1,
            energyReservesPct: 12,
            treasuryBillion: 3,
            publicApprovalPct: 6
          },
          relationEffects: { sahran: 15 }
        }
      }
    ]
  },
  {
    id: 'dec-turn1-kaldor-trade',
    turnAvailable: 1,
    titleKu: 'پێشنیاری بازرگانی ئازادی یەکێتیی کالدۆر',
    titleEn: 'Kaldor Union Free Trade Pact Proposal',
    sourceKu: 'وەزارەتی دەرەوە و نوێنەری کالدۆر لە وەیرا',
    briefKu: 'ڕاوێژکار هێلێنا ڤان ڕۆن پێشنیاری ڕێککەوتنی بازرگانی گشتگیر دەکات: کالدۆر ١٠ ملیار دۆلار لە تەکنەلۆژیا و ژێرخانی ئارڤێن خەرج دەکات لە بەرامبەر لابردنی باجی گومرگی بەندەری لۆریان. کرێکارانی مێرۆس دەترسن کارگەکانیان بەهۆی هاوردەی بیانی دابخرێت.',
    category: 'diplomacy',
    isMandatory: true,
    options: [
      {
        id: 'opt-kaldor-full-ratify',
        textKu: 'پەیماننامەکە وەک خۆی پەسەند بکەن بۆ بەدەستهێنانی سەرمایەی زەبەلاح و گەشەی ئابووری خێرا.',
        textEn: 'Fully ratify the treaty to inject massive foreign capital and boost GDP.',
        immediateEffects: {
          treasuryBillion: 7.5,
          gdpGrowthPct: 1.8,
          unemploymentPct: 0.6,
          publicApprovalPct: -4,
          inflationPct: -0.5
        },
        relationEffects: { kaldor: 35, veloria: -15 },
        advisorReactions: {
          lina: 'support',
          nara: 'support',
          rayan: 'neutral',
          mira: 'oppose',
          darok: 'neutral'
        },
        rationaleKu: 'لینا ئاراز و نارا ڤێل دەڵێن پێویستمان بە سەرمایەی کالدۆرە؛ میرا سۆلێن هۆشداری دەدات کە کرێکارانی ناوخۆ لە کار دەردەکرێن.',
        delayedConsequence: {
          triggerTurn: 4,
          headlineKu: 'مانگرتنی سەرتاسەری کرێکارانی پۆڵا لە مێرۆس بەهۆی کاڵای کالدۆرەوە!',
          descriptionKu: 'کرێکارانی ناوخۆیی لە مێرۆس کارگەکانیان داخست چونکە کەلوپەلی کالدۆر بازاڕی داپۆشیوە. ئۆپۆزسیۆنی پەرلەمان داوای دەستلەکارکێشانەوەی وەزیری ئابووری دەکات.',
          statEffects: {
            unemploymentPct: 1.4,
            publicApprovalPct: -7,
            governmentStabilityPct: -6
          }
        }
      },
      {
        id: 'opt-kaldor-protect-workers',
        textKu: 'پەیماننامەکە مەرجدار بکەن بە باجی پاراستنی بەرهەمی ناوخۆ و سندوقی پاڵپشتی کرێکارانی مێرۆس.',
        textEn: 'Negotiate a protective quota compromise protecting domestic manufacturing.',
        immediateEffects: {
          treasuryBillion: 3.5,
          gdpGrowthPct: 0.9,
          publicApprovalPct: 6,
          governmentStabilityPct: 3
        },
        relationEffects: { kaldor: 15 },
        advisorReactions: {
          rayan: 'support',
          mira: 'support',
          nara: 'support',
          lina: 'neutral',
          darok: 'neutral'
        },
        rationaleKu: 'سازانێکی هاوسەنگ لە نێوان کالدۆر و کرێکاران؛ هەموو لایەک بەشێک لە داواکارییەکانیان دەستدەکەوێت.',
        delayedConsequence: {
          triggerTurn: 5,
          headlineKu: 'پەرەپێدانی سەکۆی هاوبەشی پیشەسازی ئارڤێن-کالدۆر لە لۆریان!',
          descriptionKu: 'ڕێککەوتنە مەرجدارەکە بووە هۆی دروستبوونی پیشەسازی بەستنەوەی نوێ لە لۆریان بە پاراستنی مافی کرێکاران، مۆدێلێکی سەرکەوتوو بۆ ئابووری نیشتمانی.',
          statEffects: {
            gdpGrowthPct: 1.4,
            unemploymentPct: -1.2,
            treasuryBillion: 4,
            publicApprovalPct: 8
          },
          relationEffects: { kaldor: 20 }
        }
      },
      {
        id: 'opt-kaldor-reject',
        textKu: 'ڕێککەوتنەکە رەت بکەنەوە بۆ پاراستنی سەروەری تەواوی پیشەسازی ناوخۆیی.',
        textEn: 'Reject the pact to defend full economic sovereignty.',
        immediateEffects: {
          publicApprovalPct: 4,
          gdpGrowthPct: -0.6,
          treasuryBillion: -1
        },
        relationEffects: { kaldor: -25, veloria: 10 },
        advisorReactions: {
          mira: 'support',
          darok: 'support',
          lina: 'oppose',
          nara: 'oppose',
          rayan: 'oppose'
        },
        rationaleKu: 'ناسیۆنالیستەکان دڵخۆش دەبن، بەڵام کالدۆر توڕە دەبێت و بەرەو ڤێلۆریا دەچێت.',
        delayedConsequence: {
          triggerTurn: 3,
          headlineKu: 'کالدۆر و ڤێلۆریا هاوپەیمانی بازرگانی گەورەی دەریاییان راگەیاند، لۆریان پشتگوێ خرا!',
          descriptionKu: 'لەبەر رەتکردنەوەی ئارڤێن، کالدۆر سەرمایەکەی بردە بەندەرەکانی فیدراسیۆنی ڤێلۆریا، ئەمەش زیانی ساڵانەی ٧ ملیار دۆلار لە گومرگی ئارڤێن دەدات.',
          statEffects: {
            gdpGrowthPct: -1.0,
            treasuryBillion: -3,
            publicApprovalPct: -5
          },
          relationEffects: { kaldor: -10, veloria: -20 }
        }
      }
    ]
  }
];

export const INITIAL_GAME_STATE: GameState = {
  version: 1,
  turn: 1,
  maxTurns: 12,
  isGameOver: false,
  currentSessionId: 'session-turn-1',
  rollingSummaryKu: 'کۆبوونەوەی دەستپێکی ئەنجومەنی وەزیران: قەیرانی داواکاری باجی گازی دراڤیک و پێشنیاری بازرگانی ئازادی کالدۆر خراونەتە بەردەم سەرۆک.',
  currentTopicKu: 'قەیرانی گازی دراڤیک و هاوبەشی بازرگانی کالدۆر',
  stats: {
    treasuryBillion: 48.5,
    debtBillion: 120.0,
    gdpGrowthPct: 2.1,
    inflationPct: 6.8,
    unemploymentPct: 7.4,
    taxRatePct: 24.0,
    energyReservesPct: 48,
    foodReservesPct: 65,
    infrastructureIndex: 68,
    publicApprovalPct: 46,
    governmentStabilityPct: 52,
    pressFreedomPct: 70,
    militaryReadinessPct: 65
  },
  advisors: INITIAL_ADVISORS,
  countries: INITIAL_COUNTRIES,
  parties: INITIAL_PARTIES,
  cities: INITIAL_CITIES,
  pendingDecisions: INITIAL_DECISIONS,
  delayedConsequences: [],
  sideAgreements: [
    {
      id: 'side-agreement-1',
      titleKu: 'هەماهەنگی نهێنی بودجەی دیپلۆماسی و بەندەری لۆریان',
      participants: ['lina', 'nara'],
      purposeKu: 'رێککەوتنی نێوان وەزیری دەرەوە و وەزیری دارایی بۆ پەسەندکردنی بازرگانی کالدۆر لە بەرامبەر وەبەرهێنان لە بەندەری لۆریان نەک کڕینی تانک.',
      conditionsKu: 'نارا لە پەرلەمان پشتگیری پەیماننامەی کالدۆر دەکات ئەگەر لینا قەناعەت بە سەرۆک بکات بودجەی چەکی زیادە کەم بکاتەوە.',
      status: 'active',
      turnCreated: 1,
      discovered: false,
      discoveryReliability: 'verified',
      consequenceKu: 'هەماهەنگی دارایی-دیپلۆماسی بۆ کۆنتڕۆڵی کورتهێنانی خەزێنە'
    }
  ],
  pendingProposals: [],
  chronicle: [
    {
      id: 'chronicle-start',
      turn: 1,
      timestamp: Date.now() - 3600000,
      titleKu: 'دەستبەکاربوونی سەرۆکایەتی کۆمار و دانیشتنی یەکەمی ئەنجومەن',
      contentKu: 'بەڕێز جەنابی سەرۆک کۆمار سوێندی یاسایی لەبەردەم پەرلەمان خوارد. وڵات بە دۆخێکی هەستیاری هاوپەیمانی و قەیرانی وزەی باکوور دەست بە کار دەکات. هەڵبژاردنی داهاتوو دوای ١١ وەرزی تر بەڕێوەدەچێت.',
      category: 'decision',
      topicKu: 'دەستبەکاربوون',
      isSecret: false,
      impactSummaryKu: 'دامەزراندنی مێزی باڵادەست بۆ بەڕێوەبردنی وڵات.'
    }
  ],
  bills: INITIAL_BILLS,
  chatHistory: [
    {
      id: 'chat-init-1',
      turn: 1,
      sessionId: 'session-turn-1',
      sender: 'rayan',
      speakerNameKu: 'ڕایان دەروان (سەرۆک وەزیران)',
      textKu: 'بەخێربێن جەنابی سەرۆک. ئەنجومەنی وەزیران و سەرکردەی ئۆپۆزسیۆن لە هۆڵی مێزی باڵادەست ئامادەن. پاشا ڤیکتۆری دراڤیک چاوەڕێی وەڵاممانە لەسەر هێڵی باکوور، و شاندی کالدۆریش گەیشتوونەتە وەیرا. فەرموون، سەرۆکایەتی کۆبوونەوەکە بکەن.',
      timestamp: Date.now() - 60000
    }
  ],
  activeCrisesCount: 2,
  treatiesSigned: []
};
