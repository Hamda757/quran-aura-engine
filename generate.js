// generate.js  —  ADAGDS  |  node generate.js
'use strict';
const { Worker } = require('worker_threads');
const path = require('path');

const APPS = [
  {
    appId: 'app_01',
    appName: 'Quran Al-Fatiha • Bloom',
    theme: 'light',
    primaryColor: '0xFF3182CE',
    surahNumber: 1,
    language: 'ur',
    features: { arabicText:true, urduTranslation:true, advancedNavigation:true, versesExplorerMatrix:true, kidsMode:true },
    content: [
      { verse:1, arabic:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', urdu:'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔' },
      { verse:2, arabic:'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',   urdu:'سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔' },
      { verse:3, arabic:'الرَّحْمَٰنِ الرَّحِيمِ',                 urdu:'بڑا مہربان، نہایت رحم والا۔' },
      { verse:4, arabic:'مَالِكِ يَوْمِ الدِّينِ',                 urdu:'بدلے کے دن کا مالک۔' },
      { verse:5, arabic:'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',urdu:'ہم تیری ہی عبادت کرتے ہیں اور تجھ سے ہی مدد مانگتے ہیں۔' },
      { verse:6, arabic:'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',     urdu:'ہمیں سیدھے راستے کی ہدایت دے۔' },
      { verse:7, arabic:'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', urdu:'ان لوگوں کے راستے پر جن پر تو نے انعام کیا۔' },
    ],
  },
  {
    appId: 'app_02',
    appName: 'Surah Al-Kawthar • Midnight Moss',
    theme: 'dark',
    primaryColor: '0xFF38A169',
    surahNumber: 108,
    language: 'ur',
    features: { arabicText:true, urduTranslation:true, advancedNavigation:true, wuduGuideDetailed:true },
    content: [
      { verse:1, arabic:'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',           urdu:'بیشک ہم نے آپ کو خیرِ کثیر (حوضِ کوثر) عطا فرمائی۔' },
      { verse:2, arabic:'فَصَلِّ لِرَبِّكَ وَانْحَرْ',                urdu:'پس آپ اپنے رب کے لیے نماز پڑھیں اور قربانی دیں۔' },
      { verse:3, arabic:'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',           urdu:'بیشک آپ کا دشمن ہی بے نام و نشان رہے گا۔' },
    ],
    prayerData: { zone:'Lahore, Pakistan', timings:{ Fajr:'04:30 AM', Dhuhr:'12:15 PM', Asr:'04:45 PM', Maghrib:'07:00 PM', Isha:'08:30 PM' } },
  },
  {
    appId: 'app_03',
    appName: 'Surah Al-Asr',
    theme: 'dark',
    primaryColor: '0xFF1E88E5',
    surahNumber: 103,
    language: 'ur',
    features: { arabicText:true, urduTranslation:true, audioPlayback:true, kidsMode:false },
    content: [
      { verse:1, arabic:'وَالْعَصْرِ',                                                                                           urdu:'زمانے کی قسم!' },
      { verse:2, arabic:'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',                                                                     urdu:'بیشک انسان سراسر نقصان میں ہے۔' },
      { verse:3, arabic:'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', urdu:'سوائے ان لوگوں کے جو ایمان لائے، اچھے کام کیے، حق کی تاکید کی اور صبر کی وصیت کی۔' },
    ],
  },
  {
    appId: 'app_04',
    appName: 'Surah An-Nasr — Interactive Play',
    theme: 'light',
    primaryColor: '0xFFD97706',
    surahNumber: 110,
    language: 'ur',
    features: { arabicText:true, urduTranslation:true, audioPlayback:true, kidsMode:true },
    content: [
      { verse:1, arabic:'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',                              urdu:'جب اللہ کی مدد اور فتح آ جائے۔' },
      { verse:2, arabic:'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',        urdu:'اور آپ لوگوں کو دیکھیں کہ وہ اللہ کے دین میں فوج در فوج داخل ہو رہے ہیں۔' },
      { verse:3, arabic:'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', urdu:'تو اپنے رب کی حمد کے ساتھ تسبیح کریں اور اس سے مغفرت مانگیں — وہ بڑا توبہ قبول کرنے والا ہے۔' },
    ],
  },
  {
    appId: 'app_05',
    appName: 'Surah Al-Mulk • Cyber Royal',
    theme: 'dark',
    primaryColor: '0xFF6366F1',
    surahNumber: 67,
    features: { arabicText:true, urduTranslation:true, audioPlayback:true, kidsMode:false },
    content: [
      { verse:1, arabic:'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',                          urdu:'بہت برکت والا ہے وہ جس کے ہاتھ میں بادشاہی ہے، اور وہ ہر چیز پر قادر ہے۔' },
      { verse:2, arabic:'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا', urdu:'جس نے موت اور زندگی کو پیدا کیا تاکہ تمہیں آزمائے کہ تم میں سے اچھے عمل کس کے ہیں۔' },
    ],
    prayerData: {
      zone:'Lahore, Pakistan',
      calculationMethod:'University of Islamic Sciences, Karachi (UISK)',
      timings:{ Fajr:'04:02 AM', Dhuhr:'12:14 PM', Asr:'05:01 PM', Maghrib:'07:04 PM', Isha:'08:35 PM' },
    },
    wuduSteps: [
      { step:1, title:'Intent (Niyyah)', detail_ur:'دل میں وضو کی نیت کرنا اور بسم اللہ پڑھنا۔' },
      { step:2, title:'Washing Hands',  detail_ur:'دونوں ہاتھوں کو کلائیوں تک تین بار دھونا۔' },
    ],
  },
  {
    appId: 'app_06',
    appName: 'Surah Al-Ikhlas • Kids Bloom',
    theme: 'light',
    primaryColor: '0xFFEC4899',
    surahNumber: 112,
    features: { arabicText:true, urduTranslation:true, audioPlayback:false, kidsMode:true },
    content: [
      { verse:1, arabic:'قُلْ هُوَ اللَّهُ أَحَدٌ',          urdu:'آپ فرما دیجئے: وہ اللہ ایک ہے۔' },
      { verse:2, arabic:'اللَّهُ الصَّمَدُ',                  urdu:'اللہ بے نیاز ہے (سب اس کے محتاج ہیں)۔' },
      { verse:3, arabic:'لَمْ يَلِدْ وَلَمْ يُولَدْ',        urdu:'نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے۔' },
      { verse:4, arabic:'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', urdu:'اور کوئی بھی اس کا ہم سر نہیں۔' },
    ],
    prayerData: {
      zone:'Karachi, Southern Coastal',
      calculationMethod:'UISK - Standard',
      timings:{ Fajr:'04:35 AM', Dhuhr:'12:32 PM', Asr:'05:12 PM', Maghrib:'07:22 PM', Isha:'08:50 PM' },
    },
    wuduSteps: [
      { step:1, title:'Rinsing Mouth',  detail_ur:'تین بار اچھی طرح کلی کرنا۔' },
      { step:2, title:'Sniffing Water', detail_ur:'تین بار ناک میں پانی ڈال کر بائیں ہاتھ سے صاف کرنا۔' },
    ],
  },
  {
    appId: 'app_07',
    appName: 'Surah Al-Qadr • Midnight Velvet',
    theme: 'dark',
    primaryColor: '0xFFF59E0B',
    surahNumber: 97,
    features: { arabicText:true, urduTranslation:true, audioPlayback:true, kidsMode:false },
    content: [
      { verse:1, arabic:'إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', urdu:'بیشک ہم نے اس (قرآن) کو شبِ قدر میں اتارا ہے۔' },
      { verse:2, arabic:'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ',       urdu:'اور آپ کو کیا معلوم کہ شبِ قدر کیا ہے؟' },
      { verse:3, arabic:'لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ', urdu:'شبِ قدر ہزار مہینوں سے بہتر ہے۔' },
      { verse:4, arabic:'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا',   urdu:'اس میں فرشتے اور روح (جبریل) اترتے ہیں۔' },
      { verse:5, arabic:'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',      urdu:'وہ رات طلوعِ فجر تک سراسر سلامتی ہے۔' },
    ],
    prayerData: {
      zone:'Islamabad / Rawalpindi',
      calculationMethod:'Spiritual Calendar North',
      timings:{ Fajr:'03:58 AM', Dhuhr:'12:15 PM', Asr:'05:08 PM', Maghrib:'07:11 PM', Isha:'08:44 PM' },
    },
    wuduSteps: [
      { step:1, title:'Washing Face', detail_ur:'پیشانی کے بالوں سے ٹھوڑی کے نیچے تک پورا چہرہ تین بار دھونا۔' },
      { step:2, title:'Washing Arms', detail_ur:'دونوں بازوؤں کو کہنیوں سمیت تین بار دھونا۔' },
    ],
  },
];

// ─── Spawn workers ─────────────────────────────────────────────
console.log(`\n🕌  ADAGDS — Generating ${APPS.length} Flutter Quran Apps\n${'━'.repeat(56)}`);
let done = 0;

APPS.forEach(config => {
  const w = new Worker(path.join(__dirname, 'worker.js'), { workerData: { config } });
  w.on('message', msg => {
    done++;
    if (msg.success) {
      console.log(`  ✅  ${msg.appId.padEnd(10)}  ${msg.path}   (${msg.duration}ms)`);
    } else {
      console.error(`  ❌  ${msg.appId.padEnd(10)}  ERROR: ${msg.error}`);
    }
    if (done === APPS.length) {
      const ok = APPS.length - (APPS.length - done);
      console.log(`${'━'.repeat(56)}\n✨  Complete! All ${APPS.length} apps generated.\n`);
      console.log('Run any app:\n  cd output/<app_id>\n  flutter pub get\n  flutter run -d chrome\n');
    }
  });
  w.on('error', err => {
    done++;
    console.error(`  💥  ${config.appId} crashed: ${err.message}`);
  });
});