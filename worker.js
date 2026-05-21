// ============================================================
//  worker.js  —  ADAGDS Flutter Quran App Generator
//  Node.js Worker Thread — zero Dart placeholders
//  Usage:  node generate.js
// ============================================================
'use strict';

const { workerData, parentPort } = require('worker_threads');
const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g,  "\\'")
    .replace(/\$/g, '\\$')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

function dartBool(val) { return val ? 'true' : 'false'; }

// ─────────────────────────────────────────────────────────────
//  MAIN ENTRY
// ─────────────────────────────────────────────────────────────
function generateApp(cfg) {
  const root = path.join(__dirname, 'output', cfg.appId);
  fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
  fs.mkdirSync(path.join(root, 'web'), { recursive: true });

  const isDark    = cfg.theme !== 'light';
  const hasAudio  = !!(cfg.features && cfg.features.audioPlayback);
  const hasUrdu   = !!(cfg.features && cfg.features.urduTranslation);
  const hasKids   = !!(cfg.features && cfg.features.kidsMode);
  const hasWudu   = !!(cfg.features && cfg.features.wuduGuideDetailed);

  const verses    = Array.isArray(cfg.content) ? cfg.content : [];
  const safeVerse = esc(JSON.stringify(verses));

  const pt = (cfg.prayerData && cfg.prayerData.timings) ? cfg.prayerData.timings : {};
  const pZone   = esc((cfg.prayerData && cfg.prayerData.zone) || 'Lahore, Pakistan');
  const pFajr   = esc(pt.Fajr    || '04:30 AM');
  const pDhuhr  = esc(pt.Dhuhr   || '12:15 PM');
  const pAsr    = esc(pt.Asr     || '04:45 PM');
  const pMaghrib= esc(pt.Maghrib || '07:00 PM');
  const pIsha   = esc(pt.Isha    || '08:30 PM');

  const cfgWudu = Array.isArray(cfg.wuduSteps) ? cfg.wuduSteps : [];

  const hex     = cfg.primaryColor || '0xFF10B981';
  const appName = (cfg.appName  || 'Quran App').replace(/"/g, '\\"');
  const surahNo = String(cfg.surahNumber || 1);

  const brightness    = isDark ? 'Brightness.dark'         : 'Brightness.light';
  const appBarBgExpr  = isDark ? 'const Color(0xD9060A12)' : 'const Color(0xCCFFFFFF)';
  const navBgExpr     = isDark ? 'const Color(0xD90D1220)' : 'const Color(0xCCFFFFFF)';
  const glassExpr     = isDark ? 'const Color(0xB30E1523)' : 'const Color(0xB8FFFFFF)';
  const glassBorder   = isDark ? 'Colors.white.withOpacity(0.07)' : 'Colors.black.withOpacity(0.05)';
  const textPrimary   = isDark ? 'const Color(0xFFF9FAFB)' : 'const Color(0xFF0F172A)';
  const textSecondary = isDark ? 'const Color(0xFF94A3B8)' : 'const Color(0xFF475569)';
  const ambientGlows  = isDark
    ? `Positioned(top:-60,left:-60,child:_Glow(color:brand,size:280,opacity:0.10)),
       Positioned(bottom:200,right:-80,child:_Glow(color:const Color(0xFF6366F1),size:220,opacity:0.08)),`
    : '';
  const wuduGlows = isDark
    ? `Positioned(top:20,right:-40,child:_Glow(color:const Color(0xFF06B6D4),size:220,opacity:0.09)),
       Positioned(bottom:240,left:-60,child:_Glow(color:const Color(0xFF8B5CF6),size:200,opacity:0.08)),`
    : '';
  const prayerGlow = isDark
    ? `Positioned(top:0,left:-80,child:_Glow(color:const Color(0xFF6366F1),size:260,opacity:0.10)),`
    : '';

  const audioBottomPos = hasAudio ? '250' : '108';

  const kidsBadge = hasKids ? `
                    Container(
                      margin:const EdgeInsets.only(right:10),
                      padding:const EdgeInsets.symmetric(horizontal:12,vertical:5),
                      decoration:BoxDecoration(
                        gradient:const LinearGradient(colors:[Color(0xFFFBBF24),Color(0xFFF97316)]),
                        borderRadius:BorderRadius.circular(20)),
                      child:const Text('🐣 KIDS',style:TextStyle(color:Colors.white,fontSize:10,fontWeight:FontWeight.w900,letterSpacing:0.8)),
                    ),` : '';

  const urduBlock = hasUrdu ? `
                      const SizedBox(height:14),
                      Divider(color:${isDark ? 'Colors.white.withOpacity(0.07)' : 'Colors.black.withOpacity(0.06)'},thickness:1),
                      const SizedBox(height:12),
                      Text(item['urdu'] as String? ?? '',
                        textAlign:TextAlign.right,
                        style:TextStyle(fontSize:15,color:${textSecondary},height:1.7,fontWeight:FontWeight.w500)),` : '';

  const audioWidget = hasAudio ? `
        Positioned(
          left:16,right:16,bottom:100,
          child:_AudioCard(brand:brand,isDark:widget.isDark,isPlaying:_playing,progress:_prog,
            onToggle:()=>setState(()=>_playing=!_playing),
            onProgress:(v)=>setState(()=>_prog=v))),` : '';

  const defaultWuduSteps = [
    ['Niyyah & Bismillah','النِّيَّةُ وَالبَسْمَلَة','An-Niyyah wal Basmala',
     'Make the sincere intention in your heart to purify yourself, then say Bismillah quietly.',
     'Intention is from the heart — no verbal recitation needed.'],
    ['Wash Both Hands','غَسْلُ اليَدَيْنِ','Ghasl al-Yadayn',
     'Wash both hands up to the wrists three times, ensuring water flows between all fingers.',
     'Start with the right hand, then the left — always 3 times.'],
    ['Rinse the Mouth','المَضْمَضَة','Al-Madmadha',
     'Take water into your mouth with right hand, swirl thoroughly, spit out. Repeat 3 times.',
     'Use a swirling motion to clean the back of the mouth.'],
    ['Inhale Water into Nose','الاِسْتِنْشَاق','Al-Istinshaq',
     'Sniff water into both nostrils with right hand, blow out with left. Repeat 3 times.',
     'Do not inhale so forcefully that water enters the throat.'],
    ['Wash the Face','غَسْلُ الوَجْهِ','Ghasl al-Wajh',
     'Wash entire face three times — from hairline to chin, ear to ear.',
     'For a beard: run wet fingers to reach the skin underneath.'],
    ['Wash Arms to Elbows','غَسْلُ اليَدَيْنِ إِلَى المِرْفَقَيْنِ','Ghasl al-Yadayn ilal Mirfaqayn',
     'Wash right arm from fingertips to elbow three times, then repeat for left.',
     'Include the elbow; ensure no dry spot remains.'],
    ['Masah — Wipe the Head','مَسْحُ الرَّأْسِ وَالأُذُنَيْنِ',"Mas'h ar-Ra's",
     'Wipe over the head once — palms forward to nape and back. Clean inside ears with index fingers.',
     'Masah is done only once, not three times.'],
    ['Wash Feet to Ankles','غَسْلُ الرِّجْلَيْنِ','Ghasl ar-Rijlayn',
     'Wash right foot up to ankle three times, cleaning between toes. Repeat for left.',
     'Conclude with the Shahada dua after completing Wudu.'],
  ];

  const wuduList = defaultWuduSteps.map((s,i) =>
    `['${esc(s[0])}','${esc(s[1])}','${esc(s[2])}','${esc(s[3])}','${esc(s[4])}']`
  ).join(',\n    ');

  // ── pubspec ──────────────────────────────────────────────
  fs.writeFileSync(path.join(root, 'pubspec.yaml'),
`name: ${cfg.appId}
description: ADAGDS Quran App — ${appName}
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
flutter:
  uses-material-design: true
`);

  // ── web/index.html ───────────────────────────────────────
  fs.writeFileSync(path.join(root, 'web', 'index.html'),
`<!DOCTYPE html><html>
<head>
  <base href="/">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${appName}</title>
</head>
<body><script src="main.dart.js" type="application/javascript"></script></body>
</html>`);

  // ── main.dart ────────────────────────────────────────────
  const dart = `// AUTO-GENERATED by ADAGDS worker.js — DO NOT EDIT
// App: ${appName}  |  Surah: ${surahNo}  |  Theme: ${isDark?'dark':'light'}
import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor:Colors.transparent,statusBarIconBrightness:Brightness.light));
  runApp(const _App());
}

// ════════════════════════════════════════════════════════════
//  APP ROOT
// ════════════════════════════════════════════════════════════
class _App extends StatelessWidget {
  const _App({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    const Color brand = Color(${hex});
    return MaterialApp(
      title:"${appName}",
      debugShowCheckedModeBanner:false,
      theme:ThemeData(
        useMaterial3:true,
        brightness:${brightness},
        colorSchemeSeed:brand,
        scaffoldBackgroundColor:const Color(0x${isDark ? 'FF060A12' : 'FFF0F4F8'}),
        fontFamily:'sans-serif'),
      home:const _Shell());
  }
}

// ════════════════════════════════════════════════════════════
//  SHELL
// ════════════════════════════════════════════════════════════
class _Shell extends StatefulWidget {
  const _Shell({Key? key}) : super(key: key);
  @override State<_Shell> createState() => _ShellState();
}

class _ShellState extends State<_Shell> {
  int _tab = 0;
  static const _labels = ['Quran','Wudu','Prayer','Saved'];
  static const _iconsOff = [Icons.auto_stories_outlined,Icons.water_drop_outlined,Icons.mosque_outlined,Icons.bookmark_border];
  static const _iconsOn  = [Icons.auto_stories_rounded, Icons.water_drop_rounded, Icons.mosque_rounded, Icons.bookmark_rounded];

  @override
  Widget build(BuildContext context) {
    const Color brand = Color(${hex});
    final bool dark = Theme.of(context).brightness == Brightness.dark;
    final pages = [
      _ReaderPage(brand:brand,isDark:dark),
      _WuduPage(brand:brand,isDark:dark),
      _PrayerPage(brand:brand,isDark:dark),
      _SavedPage(brand:brand,isDark:dark),
    ];
    return Scaffold(
      backgroundColor:const Color(0x${isDark ? 'FF060A12' : 'FFF0F4F8'}),
      extendBody:true,
      appBar:_AppBar(brand:brand,isDark:dark,tab:_tab,name:"${appName}"),
      body:IndexedStack(index:_tab,children:pages),
      bottomNavigationBar:_NavBar(
        brand:brand,isDark:dark,current:_tab,
        onTap:(i)=>setState(()=>_tab=i),
        labels:_labels,iconsOff:_iconsOff,iconsOn:_iconsOn),
    );
  }
}

// ════════════════════════════════════════════════════════════
//  APP BAR
// ════════════════════════════════════════════════════════════
class _AppBar extends StatelessWidget implements PreferredSizeWidget {
  final Color brand; final bool isDark; final int tab; final String name;
  const _AppBar({required this.brand,required this.isDark,required this.tab,required this.name});
  @override Size get preferredSize => const Size.fromHeight(66);
  @override
  Widget build(BuildContext context) {
    final titles = [name,'Wudu Guide','Prayer Times','Saved'];
    final Color bg  = ${appBarBgExpr};
    final Color txt = ${textPrimary};
    return ClipRect(
      child:BackdropFilter(
        filter:ImageFilter.blur(sigmaX:20,sigmaY:20),
        child:Container(
          color:bg,
          child:SafeArea(
            bottom:false,
            child:SizedBox(
              height:66,
              child:Padding(
                padding:const EdgeInsets.symmetric(horizontal:20),
                child:Row(children:[
                  Column(
                    mainAxisAlignment:MainAxisAlignment.center,
                    crossAxisAlignment:CrossAxisAlignment.start,
                    children:[
                      Text(titles[tab],style:TextStyle(fontSize:22,fontWeight:FontWeight.w800,color:txt,letterSpacing:0.2)),
                      Text('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                        style:TextStyle(fontSize:11,color:brand.withOpacity(0.85),fontWeight:FontWeight.w600)),
                    ]),
                  const Spacer(),
                  ${kidsBadge}
                  _IBtn(icon:Icons.search_rounded,color:txt,onTap:(){}),
                  const SizedBox(width:4),
                  _IBtn(icon:Icons.settings_outlined,color:txt,onTap:(){}),
                ])))))));
  }
}

class _IBtn extends StatelessWidget {
  final IconData icon; final Color color; final VoidCallback onTap;
  const _IBtn({required this.icon,required this.color,required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap:onTap,
    child:Container(
      width:38,height:38,
      decoration:BoxDecoration(color:color.withOpacity(0.07),borderRadius:BorderRadius.circular(12)),
      child:Icon(icon,size:20,color:color.withOpacity(0.7))));
}

// ════════════════════════════════════════════════════════════
//  BOTTOM NAV
// ════════════════════════════════════════════════════════════
class _NavBar extends StatelessWidget {
  final Color brand; final bool isDark; final int current;
  final ValueChanged<int> onTap;
  final List<String> labels;
  final List<IconData> iconsOff,iconsOn;
  // ignore: use_key_in_widget_constructors
  const _NavBar({required this.brand,required this.isDark,required this.current,
    required this.onTap,required this.labels,required this.iconsOff,required this.iconsOn});
  @override
  Widget build(BuildContext context) {
    final Color nb = ${navBgExpr};
    final Color bc = isDark?Colors.white.withOpacity(0.07):Colors.black.withOpacity(0.06);
    final Color ti = isDark?Colors.white.withOpacity(0.35):Colors.black.withOpacity(0.35);
    return Padding(
      padding:const EdgeInsets.only(left:16,right:16,bottom:20),
      child:ClipRRect(
        borderRadius:BorderRadius.circular(32),
        child:BackdropFilter(
          filter:ImageFilter.blur(sigmaX:24,sigmaY:24),
          child:Container(
            height:72,
            decoration:BoxDecoration(color:nb,borderRadius:BorderRadius.circular(32),border:Border.all(color:bc,width:1)),
            child:Row(
              children:List.generate(4,(i){
                final bool sel=i==current;
                return Expanded(child:GestureDetector(
                  onTap:()=>onTap(i),behavior:HitTestBehavior.opaque,
                  child:Column(mainAxisAlignment:MainAxisAlignment.center,children:[
                    AnimatedContainer(
                      duration:const Duration(milliseconds:220),curve:Curves.easeOutCubic,
                      padding:const EdgeInsets.symmetric(horizontal:14,vertical:5),
                      decoration:BoxDecoration(
                        color:sel?brand.withOpacity(0.15):Colors.transparent,
                        borderRadius:BorderRadius.circular(14)),
                      child:Icon(sel?iconsOn[i]:iconsOff[i],size:22,color:sel?brand:ti)),
                    const SizedBox(height:3),
                    Text(labels[i],style:TextStyle(fontSize:10,
                      fontWeight:sel?FontWeight.w800:FontWeight.w500,
                      color:sel?brand:ti,letterSpacing:0.3)),
                  ])));
              }))))));
  }
}

// ════════════════════════════════════════════════════════════
//  GLASS CARD
// ════════════════════════════════════════════════════════════
class _Glass extends StatelessWidget {
  final Widget child; final bool isDark;
  final EdgeInsets? padding; final double radius; final Color? accent;
  const _Glass({Key? key,required this.child,required this.isDark,
    this.padding,this.radius=24,this.accent}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    final Color fill   = ${glassExpr};
    final Color border = accent ?? (${glassBorder});
    return ClipRRect(
      borderRadius:BorderRadius.circular(radius),
      child:BackdropFilter(
        filter:ImageFilter.blur(sigmaX:14,sigmaY:14),
        child:Container(
          padding:padding??const EdgeInsets.all(20),
          decoration:BoxDecoration(color:fill,borderRadius:BorderRadius.circular(radius),
            border:Border.all(color:border,width:1.2)),
          child:child)));
  }
}

// ════════════════════════════════════════════════════════════
//  AMBIENT GLOW
// ════════════════════════════════════════════════════════════
class _Glow extends StatelessWidget {
  final Color color; final double size,opacity;
  const _Glow({required this.color,required this.size,required this.opacity});
  @override
  Widget build(BuildContext context) => Container(
    width:size,height:size,
    decoration:BoxDecoration(shape:BoxShape.circle,
      gradient:RadialGradient(colors:[color.withOpacity(opacity),Colors.transparent])));
}

// ════════════════════════════════════════════════════════════
//  PAGE 1 — QURAN READER
// ════════════════════════════════════════════════════════════
class _ReaderPage extends StatefulWidget {
  final Color brand; final bool isDark;
  const _ReaderPage({Key? key,required this.brand,required this.isDark}) : super(key: key);
  @override State<_ReaderPage> createState() => _ReaderState();
}

class _ReaderState extends State<_ReaderPage> {
  bool _playing=false; double _prog=0.38; int _fz=28;
  final Set<int> _bk={};
  static const String _raw='${safeVerse}';
  late final List<dynamic> _verses;

  @override
  void initState(){
    super.initState();
    try{_verses=jsonDecode(_raw) as List;}catch(_){_verses=[];}
  }

  Color get _tp => ${textPrimary};
  Color get _ts => ${textSecondary};

  @override
  Widget build(BuildContext context){
    final Color brand = widget.brand;
    return Stack(children:[
      ${ambientGlows}
      ListView.builder(
        padding:const EdgeInsets.only(left:16,right:16,top:16,bottom:280),
        itemCount:_verses.isEmpty?1:_verses.length,
        itemBuilder:(ctx,i){
          if(_verses.isEmpty)
            return _Glass(isDark:widget.isDark,child:Column(children:[
              Icon(Icons.auto_stories_rounded,color:widget.brand,size:48),
              const SizedBox(height:12),
              Text('No verses loaded',style:TextStyle(color:_ts,fontSize:16)),
            ]));
          final item=_verses[i];
          final int vn=(item['verse'] as num?)?.toInt()??i+1;
          final bool bkd=_bk.contains(vn);
          return Padding(
            padding:const EdgeInsets.only(bottom:18),
            child:_Glass(isDark:widget.isDark,accent:bkd?widget.brand.withOpacity(0.35):null,
              child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:[
                Row(children:[
                  _Badge(n:vn,brand:widget.brand),
                  const Spacer(),
                  _Tap(icon:bkd?Icons.bookmark_rounded:Icons.bookmark_add_outlined,
                    color:bkd?widget.brand:_ts.withOpacity(0.5),
                    onTap:()=>setState(()=>bkd?_bk.remove(vn):_bk.add(vn))),
                  const SizedBox(width:4),
                  _Tap(icon:Icons.share_outlined,color:_ts.withOpacity(0.5),onTap:(){}),
                ]),
                const SizedBox(height:20),
                Text(item['arabic'] as String?? 'آيَة كَرِيمَة',
                  textAlign:TextAlign.right,
                  style:TextStyle(fontSize:_fz.toDouble(),fontWeight:FontWeight.w700,color:_tp,height:2.1)),
                ${urduBlock}
              ])));
        }),
      ${audioWidget}
      Positioned(right:16,bottom:${audioBottomPos},
        child:_FzCtrl(value:_fz,isDark:widget.isDark,brand:widget.brand,
          up:()=>setState(()=>_fz=(_fz<40?_fz+2:_fz)),
          dn:()=>setState(()=>_fz=(_fz>18?_fz-2:_fz)))),
    ]);
  }
}

class _Badge extends StatelessWidget {
  final int n; final Color brand;
  const _Badge({required this.n,required this.brand});
  @override
  Widget build(BuildContext ctx)=>Container(
    padding:const EdgeInsets.symmetric(horizontal:14,vertical:6),
    decoration:BoxDecoration(
      gradient:LinearGradient(colors:[brand.withOpacity(0.22),brand.withOpacity(0.06)]),
      borderRadius:BorderRadius.circular(12),
      border:Border.all(color:brand.withOpacity(0.25),width:1)),
    child:Text('AYAH \$n',style:TextStyle(color:brand,fontSize:10,fontWeight:FontWeight.w900,letterSpacing:1.2)));
}

class _Tap extends StatelessWidget {
  final IconData icon; final Color color; final VoidCallback onTap;
  const _Tap({required this.icon,required this.color,required this.onTap});
  @override
  Widget build(BuildContext ctx)=>GestureDetector(
    onTap:onTap,child:Padding(padding:const EdgeInsets.all(6),child:Icon(icon,size:20,color:color)));
}

class _FzCtrl extends StatelessWidget {
  final int value; final bool isDark; final Color brand;
  final VoidCallback up,dn;
  const _FzCtrl({required this.value,required this.isDark,required this.brand,required this.up,required this.dn});
  @override
  Widget build(BuildContext ctx){
    final Color bg=isDark?const Color(0xD90E1523):Colors.white.withOpacity(0.85);
    return ClipRRect(
      borderRadius:BorderRadius.circular(16),
      child:BackdropFilter(
        filter:ImageFilter.blur(sigmaX:12,sigmaY:12),
        child:Container(
          padding:const EdgeInsets.symmetric(horizontal:10,vertical:8),
          decoration:BoxDecoration(color:bg,borderRadius:BorderRadius.circular(16),
            border:Border.all(color:isDark?Colors.white.withOpacity(0.08):Colors.black.withOpacity(0.06))),
          child:Column(mainAxisSize:MainAxisSize.min,children:[
            GestureDetector(onTap:up,child:Icon(Icons.add,size:20,color:brand)),
            Padding(padding:const EdgeInsets.symmetric(vertical:4),
              child:Text('\$value',style:TextStyle(fontSize:11,fontWeight:FontWeight.w700,color:brand))),
            GestureDetector(onTap:dn,child:Icon(Icons.remove,size:20,color:brand)),
          ]))));
  }
}

// ════════════════════════════════════════════════════════════
//  AUDIO CARD
// ════════════════════════════════════════════════════════════
class _AudioCard extends StatelessWidget {
  final Color brand; final bool isDark;
  final bool isPlaying; final double progress;
  final VoidCallback onToggle; final ValueChanged<double> onProgress;
  const _AudioCard({required this.brand,required this.isDark,required this.isPlaying,
    required this.progress,required this.onToggle,required this.onProgress});

  String get _el{
    final t=const Duration(minutes:5,seconds:14);
    final p=Duration(seconds:(t.inSeconds*progress).round());
    return '\${p.inMinutes.remainder(60).toString().padLeft(2,'0')}:\${p.inSeconds.remainder(60).toString().padLeft(2,'0')}';
  }

  @override
  Widget build(BuildContext ctx){
    final Color tp=isDark?const Color(0xFFF9FAFB):const Color(0xFF0F172A);
    final Color ts=isDark?const Color(0xFF64748B):const Color(0xFF94A3B8);
    final Color cb=isDark?const Color(0xE60A1020):Colors.white.withOpacity(0.90);
    return ClipRRect(
      borderRadius:BorderRadius.circular(28),
      child:BackdropFilter(
        filter:ImageFilter.blur(sigmaX:20,sigmaY:20),
        child:Container(
          padding:const EdgeInsets.symmetric(horizontal:22,vertical:18),
          decoration:BoxDecoration(color:cb,borderRadius:BorderRadius.circular(28),
            border:Border.all(color:brand.withOpacity(0.22),width:1.5),
            boxShadow:[BoxShadow(color:brand.withOpacity(0.12),blurRadius:30,offset:const Offset(0,10))]),
          child:Column(mainAxisSize:MainAxisSize.min,children:[
            Row(children:[
              Container(padding:const EdgeInsets.all(8),
                decoration:BoxDecoration(color:brand.withOpacity(0.12),borderRadius:BorderRadius.circular(10)),
                child:Icon(Icons.music_note_rounded,color:brand,size:16)),
              const SizedBox(width:10),
              Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
                Text('Surah Player',style:TextStyle(fontWeight:FontWeight.w800,fontSize:13,color:tp)),
                Text('Sheikh Mishary Alafasy',style:TextStyle(fontSize:11,color:ts)),
              ])),
              Text('\$_el / 05:14',style:TextStyle(fontSize:12,color:brand,fontWeight:FontWeight.w700)),
            ]),
            const SizedBox(height:10),
            SliderTheme(
              data:SliderThemeData(
                trackHeight:3.5,
                thumbShape:const RoundSliderThumbShape(enabledThumbRadius:6),
                overlayShape:const RoundSliderOverlayShape(overlayRadius:12),
                activeTrackColor:brand,inactiveTrackColor:brand.withOpacity(0.12),
                thumbColor:brand,overlayColor:brand.withOpacity(0.15)),
              child:Slider(value:progress,onChanged:onProgress)),
            Row(mainAxisAlignment:MainAxisAlignment.center,children:[
              IconButton(icon:Icon(Icons.shuffle_rounded,size:20,color:ts.withOpacity(0.6)),onPressed:(){}),
              const Spacer(),
              IconButton(icon:Icon(Icons.skip_previous_rounded,size:30,color:tp),onPressed:(){}),
              const SizedBox(width:14),
              GestureDetector(
                onTap:onToggle,
                child:Container(
                  width:52,height:52,
                  decoration:BoxDecoration(color:brand,shape:BoxShape.circle,
                    boxShadow:[BoxShadow(color:brand.withOpacity(0.45),blurRadius:16,offset:const Offset(0,5))]),
                  child:Icon(isPlaying?Icons.pause_rounded:Icons.play_arrow_rounded,color:Colors.white,size:28))),
              const SizedBox(width:14),
              IconButton(icon:Icon(Icons.skip_next_rounded,size:30,color:tp),onPressed:(){}),
              const Spacer(),
              IconButton(icon:Icon(Icons.repeat_rounded,size:20,color:ts.withOpacity(0.6)),onPressed:(){}),
            ]),
          ]))));
  }
}

// ════════════════════════════════════════════════════════════
//  PAGE 2 — WUDU GUIDE
// ════════════════════════════════════════════════════════════
class _WuduPage extends StatefulWidget {
  final Color brand; final bool isDark;
  const _WuduPage({Key? key,required this.brand,required this.isDark}) : super(key: key);
  @override State<_WuduPage> createState() => _WuduState();
}

class _WuduState extends State<_WuduPage> with TickerProviderStateMixin {
  int _done=-1;
  late AnimationController _pc;
  late Animation<double> _pulse;

  static const _steps = [
    ${wuduList}
  ];
  static const _sColors=[Color(0xFF8B5CF6),Color(0xFF06B6D4),Color(0xFF10B981),Color(0xFF3B82F6),
    Color(0xFFF59E0B),Color(0xFFEC4899),Color(0xFF8B5CF6),Color(0xFF06B6D4)];
  static const _sIcons=[Icons.self_improvement_rounded,Icons.back_hand_outlined,Icons.water_drop_rounded,
    Icons.air_rounded,Icons.face_rounded,Icons.accessibility_new_rounded,Icons.hearing_rounded,Icons.do_not_step_rounded];

  @override
  void initState(){
    super.initState();
    _pc=AnimationController(vsync:this,duration:const Duration(milliseconds:1200))..repeat(reverse:true);
    _pulse=Tween<double>(begin:0.95,end:1.05).animate(CurvedAnimation(parent:_pc,curve:Curves.easeInOut));
  }
  @override void dispose(){_pc.dispose();super.dispose();}

  @override
  Widget build(BuildContext context){
    final Color tp=${textPrimary};
    final Color ts=${textSecondary};
    final int cnt=_done+1;
    final double pct=cnt/_steps.length;

    return Stack(children:[
      ${wuduGlows}
      CustomScrollView(slivers:[
        SliverToBoxAdapter(child:Padding(
          padding:const EdgeInsets.fromLTRB(16,16,16,0),
          child:_Glass(isDark:widget.isDark,radius:22,child:Column(
            crossAxisAlignment:CrossAxisAlignment.start,
            children:[
              Row(children:[
                Container(padding:const EdgeInsets.all(10),
                  decoration:BoxDecoration(color:widget.brand.withOpacity(0.15),borderRadius:BorderRadius.circular(12)),
                  child:Icon(Icons.water_drop_rounded,color:widget.brand,size:22)),
                const SizedBox(width:14),
                Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
                  Text('Wudu Progress',style:TextStyle(fontWeight:FontWeight.w800,fontSize:15,color:tp)),
                  Text('\$cnt of \${_steps.length} steps done',style:TextStyle(fontSize:12,color:ts)),
                ])),
                Text('\${(pct*100).round()}%',style:TextStyle(fontSize:20,fontWeight:FontWeight.w900,color:widget.brand)),
              ]),
              const SizedBox(height:14),
              _PBar(value:pct,brand:widget.brand),
              if(cnt==_steps.length)...[
                const SizedBox(height:14),
                Container(
                  width:double.infinity,padding:const EdgeInsets.symmetric(vertical:10),
                  decoration:BoxDecoration(color:widget.brand.withOpacity(0.12),borderRadius:BorderRadius.circular(12)),
                  child:Row(mainAxisAlignment:MainAxisAlignment.center,children:[
                    Icon(Icons.check_circle_rounded,color:widget.brand,size:18),
                    const SizedBox(width:8),
                    Text('Wudu Complete — Alhamdulillah!',
                      style:TextStyle(color:widget.brand,fontWeight:FontWeight.w700,fontSize:13)),
                  ])),
              ],
            ])))),
        SliverPadding(
          padding:const EdgeInsets.only(left:16,right:16,top:14,bottom:110),
          sliver:SliverList(delegate:SliverChildBuilderDelegate(
            (ctx,i){
              final bool done=i<=_done;
              final bool act =i==_done+1;
              final Color sc=done?widget.brand:(act?_sColors[i]:ts.withOpacity(0.3));
              return Padding(
                padding:const EdgeInsets.only(bottom:14),
                child:GestureDetector(
                  onTap:()=>setState((){
                    if(i==_done+1)_done=i;
                    else if(i<=_done)_done=i-1;
                  }),
                  child:_Glass(isDark:widget.isDark,radius:22,
                    accent:act?_sColors[i].withOpacity(0.4):(done?widget.brand.withOpacity(0.2):null),
                    child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[
                      Column(children:[
                        act
                          ?ScaleTransition(scale:_pulse,
                              child:_SCircle(icon:_sIcons[i],color:_sColors[i],done:false,brand:widget.brand))
                          :_SCircle(icon:_sIcons[i],color:sc,done:done,brand:widget.brand),
                        if(i<7)...[
                          const SizedBox(height:6),
                          Container(width:1.5,height:20,
                            decoration:BoxDecoration(gradient:LinearGradient(
                              begin:Alignment.topCenter,end:Alignment.bottomCenter,
                              colors:[sc.withOpacity(0.5),sc.withOpacity(0.0)]))),
                        ],
                      ]),
                      const SizedBox(width:16),
                      Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
                        Row(crossAxisAlignment:CrossAxisAlignment.start,children:[
                          Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
                            Text('\${i+1}. \${_steps[i][0]}',
                              style:TextStyle(fontWeight:FontWeight.w800,fontSize:14,
                                color:(done||act)?tp:tp.withOpacity(0.5))),
                            Text(_steps[i][2],style:TextStyle(fontSize:11,
                              color:act?_sColors[i]:ts.withOpacity(0.6),fontStyle:FontStyle.italic)),
                          ])),
                          const SizedBox(width:8),
                          Text(_steps[i][1],style:TextStyle(fontSize:14,fontWeight:FontWeight.bold,
                            color:act?_sColors[i]:ts.withOpacity(0.7))),
                        ]),
                        const SizedBox(height:10),
                        Text(_steps[i][3],style:TextStyle(fontSize:13,
                          color:(done||act)?ts:ts.withOpacity(0.45),height:1.55)),
                        if(act||done)...[
                          const SizedBox(height:10),
                          Container(
                            padding:const EdgeInsets.symmetric(horizontal:12,vertical:8),
                            decoration:BoxDecoration(color:_sColors[i].withOpacity(0.08),
                              borderRadius:BorderRadius.circular(10),
                              border:Border.all(color:_sColors[i].withOpacity(0.15),width:1)),
                            child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[
                              Icon(Icons.lightbulb_outline_rounded,size:14,color:_sColors[i]),
                              const SizedBox(width:7),
                              Expanded(child:Text(_steps[i][4],
                                style:TextStyle(fontSize:12,color:_sColors[i],height:1.4))),
                            ])),
                        ],
                        if(act)...[
                          const SizedBox(height:12),
                          GestureDetector(
                            onTap:()=>setState(()=>_done=i),
                            child:Container(
                              width:double.infinity,padding:const EdgeInsets.symmetric(vertical:10),
                              decoration:BoxDecoration(color:_sColors[i],borderRadius:BorderRadius.circular(12),
                                boxShadow:[BoxShadow(color:_sColors[i].withOpacity(0.35),blurRadius:12,offset:const Offset(0,4))]),
                              child:const Text('Mark as Done ✓',textAlign:TextAlign.center,
                                style:TextStyle(color:Colors.white,fontWeight:FontWeight.w800,fontSize:13)))),
                        ],
                      ])),
                    ]))));
            },
            childCount:_steps.length))),
      ]),
      if(_done>=0)
        Positioned(bottom:20,left:16,right:16,
          child:GestureDetector(
            onTap:()=>setState(()=>_done=-1),
            child:ClipRRect(
              borderRadius:BorderRadius.circular(18),
              child:BackdropFilter(
                filter:ImageFilter.blur(sigmaX:12,sigmaY:12),
                child:Container(
                  height:52,alignment:Alignment.center,
                  decoration:BoxDecoration(
                    color:widget.isDark?Colors.white.withOpacity(0.06):Colors.black.withOpacity(0.04),
                    borderRadius:BorderRadius.circular(18),
                    border:Border.all(color:widget.isDark?Colors.white.withOpacity(0.08):Colors.black.withOpacity(0.06))),
                  child:Text('Reset Wudu Steps',
                    style:TextStyle(fontSize:14,fontWeight:FontWeight.w700,
                      color:widget.isDark?Colors.white60:Colors.black45))))))),
    ]);
  }
}

class _SCircle extends StatelessWidget {
  final IconData icon; final Color color,brand; final bool done;
  const _SCircle({required this.icon,required this.color,required this.brand,required this.done});
  @override
  Widget build(BuildContext ctx)=>Container(
    width:46,height:46,
    decoration:BoxDecoration(color:color.withOpacity(0.14),shape:BoxShape.circle,
      border:Border.all(color:color.withOpacity(0.3),width:1.5)),
    child:Center(child:done?Icon(Icons.check_rounded,color:brand,size:22):Icon(icon,color:color,size:22)));
}

class _PBar extends StatelessWidget {
  final double value; final Color brand;
  const _PBar({required this.value,required this.brand});
  @override
  Widget build(BuildContext ctx)=>LayoutBuilder(builder:(ctx,c){
    final double w=c.maxWidth;
    return Stack(children:[
      Container(height:6,width:w,decoration:BoxDecoration(
        color:brand.withOpacity(0.12),borderRadius:BorderRadius.circular(3))),
      AnimatedContainer(
        duration:const Duration(milliseconds:400),curve:Curves.easeOutCubic,
        height:6,width:w*value.clamp(0.0,1.0),
        decoration:BoxDecoration(
          gradient:LinearGradient(colors:[brand,brand.withOpacity(0.6)]),
          borderRadius:BorderRadius.circular(3),
          boxShadow:[BoxShadow(color:brand.withOpacity(0.4),blurRadius:6)])),
    ]);
  });
}

// ════════════════════════════════════════════════════════════
//  PAGE 3 — PRAYER TIMES
// ════════════════════════════════════════════════════════════
class _PrayerPage extends StatelessWidget {
  final Color brand; final bool isDark;
  const _PrayerPage({Key? key,required this.brand,required this.isDark}) : super(key: key);

  static const _names    = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
  static const _arabics  = ['الفَجْر','الظُّهْر','العَصْر','المَغْرِب','العِشَاء'];
  static const _times    = ['${pFajr}','${pDhuhr}','${pAsr}','${pMaghrib}','${pIsha}'];
  static const _icons    = [Icons.wb_twilight_rounded,Icons.wb_sunny_rounded,
    Icons.light_mode_outlined,Icons.nights_stay_outlined,Icons.bedtime_outlined];
  static const _pColors  = [Color(0xFF6366F1),Color(0xFFF59E0B),
    Color(0xFFEF4444),Color(0xFFEC4899),Color(0xFF8B5CF6)];

  @override
  Widget build(BuildContext ctx){
    final Color tp=${textPrimary};
    final Color ts=${textSecondary};
    return Stack(children:[
      ${prayerGlow}
      ListView(
        padding:const EdgeInsets.only(left:16,right:16,top:16,bottom:110),
        children:[
          _Glass(isDark:isDark,radius:22,child:Row(children:[
            Container(width:56,height:56,
              decoration:BoxDecoration(color:brand.withOpacity(0.12),borderRadius:BorderRadius.circular(14)),
              child:Column(mainAxisAlignment:MainAxisAlignment.center,children:[
                Text('21',style:TextStyle(fontSize:22,fontWeight:FontWeight.w900,color:brand)),
                Text('MAY',style:TextStyle(fontSize:9,fontWeight:FontWeight.w800,color:brand.withOpacity(0.7),letterSpacing:1)),
              ])),
            const SizedBox(width:16),
            Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
              Text('23 Dhul Qadah, 1446',style:TextStyle(fontWeight:FontWeight.w800,fontSize:15,color:tp)),
              Text('${pZone}',style:TextStyle(fontSize:12,color:ts)),
            ]),
            const Spacer(),
            Icon(Icons.location_on_outlined,color:brand,size:20),
          ])),
          const SizedBox(height:14),
          ...List.generate(5,(i)=>Padding(
            padding:const EdgeInsets.only(bottom:12),
            child:_Glass(isDark:isDark,radius:20,
              padding:const EdgeInsets.symmetric(horizontal:18,vertical:14),
              child:Row(children:[
                Container(width:44,height:44,
                  decoration:BoxDecoration(color:_pColors[i].withOpacity(0.14),shape:BoxShape.circle,
                    border:Border.all(color:_pColors[i].withOpacity(0.25),width:1)),
                  child:Icon(_icons[i],color:_pColors[i],size:20)),
                const SizedBox(width:14),
                Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
                  Text(_names[i],style:TextStyle(fontWeight:FontWeight.w800,fontSize:14,color:tp)),
                  Text(_arabics[i],style:TextStyle(fontSize:11,color:_pColors[i])),
                ])),
                Text(_times[i],style:TextStyle(fontWeight:FontWeight.w900,fontSize:15,color:tp,letterSpacing:0.5)),
                const SizedBox(width:12),
                Icon(Icons.notifications_none_rounded,size:20,color:ts.withOpacity(0.5)),
              ])))),
        ]),
    ]);
  }
}

// ════════════════════════════════════════════════════════════
//  PAGE 4 — SAVED
// ════════════════════════════════════════════════════════════
class _SavedPage extends StatelessWidget {
  final Color brand; final bool isDark;
  const _SavedPage({Key? key,required this.brand,required this.isDark}) : super(key: key);
  @override
  Widget build(BuildContext ctx){
    final Color tp=${textPrimary};
    final Color ts=${textSecondary};
    return ListView(
      padding:const EdgeInsets.only(left:16,right:16,top:16,bottom:110),
      children:[
        _Glass(isDark:isDark,radius:22,child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          Row(children:[
            Icon(Icons.bookmark_rounded,color:brand,size:22),
            const SizedBox(width:10),
            Text('Bookmarked Verses',style:TextStyle(fontWeight:FontWeight.w800,fontSize:16,color:tp)),
          ]),
          const SizedBox(height:20),
          Center(child:Column(children:[
            Icon(Icons.bookmark_add_outlined,color:brand.withOpacity(0.35),size:52),
            const SizedBox(height:12),
            Text('No bookmarks yet',style:TextStyle(fontWeight:FontWeight.w700,fontSize:15,color:tp)),
            const SizedBox(height:6),
            Text('Tap the bookmark icon on any verse to save it here.',
              textAlign:TextAlign.center,
              style:TextStyle(fontSize:13,color:ts,height:1.5)),
          ])),
        ])),
        const SizedBox(height:16),
        _Glass(isDark:isDark,radius:22,child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          Row(children:[
            Icon(Icons.history_rounded,color:brand,size:22),
            const SizedBox(width:10),
            Text('Reading History',style:TextStyle(fontWeight:FontWeight.w800,fontSize:16,color:tp)),
          ]),
          const SizedBox(height:12),
          Text('Your last 10 viewed surahs will appear here.',
            style:TextStyle(fontSize:13,color:ts,height:1.5)),
        ])),
      ]);
  }
}
`;

  fs.writeFileSync(path.join(root, 'lib', 'main.dart'), dart);
  return root;
}

// ─── Worker entry ─────────────────────────────────────────────
const cfg   = workerData.config;
const start = Date.now();
try {
  const appDir  = generateApp(cfg);
  parentPort.postMessage({ success: true, appId: cfg.appId, path: appDir, duration: Date.now() - start });
} catch (e) {
  parentPort.postMessage({ success: false, appId: cfg.appId, error: e.message });
}