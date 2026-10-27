// ALL texts of the patient pages, in one table.
// One row per text, one column per language, in this order:
//   en (English) | fr (Français) | ar (العربية) | ti (ትግርኛ) | prs (دری) | ps (پښتو) | so (Soomaali) | tr (Türkçe) | uk (Українська)
// Every language except English is a MACHINE TRANSLATION that has not been checked by a speaker.
// To correct a word, edit it in its column. Leave a cell as "" to fall back to English.

export const PATIENT_LANGS = ["fr", "en", "ar", "ti", "prs", "ps", "so", "tr", "uk"] as const;
export type PatientLang = (typeof PATIENT_LANGS)[number];

const COLUMNS = ["en", "fr", "ar", "ti", "prs", "ps", "so", "tr", "uk"] as const;

export const LANGUAGE_INFO: Record<PatientLang, { name: string; dir: "ltr" | "rtl" }> = {
  fr: { name: "Français", dir: "ltr" },
  en: { name: "English", dir: "ltr" },
  ar: { name: "العربية", dir: "rtl" },
  ti: { name: "ትግርኛ", dir: "ltr" },
  prs: { name: "دری", dir: "rtl" },
  ps: { name: "پښتو", dir: "rtl" },
  so: { name: "Soomaali", dir: "ltr" },
  tr: { name: "Türkçe", dir: "ltr" },
  uk: { name: "Українська", dir: "ltr" },
};

type Row = readonly [en: string, fr: string, ar: string, ti: string, prs: string, ps: string, so: string, tr: string, uk: string];

const TABLE = {
  // ---------- Shared ----------
  language: ["Language", "Langue", "اللغة", "ቋንቋ", "زبان", "ژبه", "Luqadda", "Dil", "Мова"],
  hello: ["Hello! How can we help?", "Bonjour ! Comment pouvons-nous aider ?", "مرحبًا! كيف يمكننا المساعدة؟", "ሰላም! ብኸመይ ክንሕግዘኩም ንኽእል?", "سلام! چطور می‌توانیم کمک کنیم؟", "سلام! څنګه مرسته کولای شو؟", "Salaan! Sidee kuu caawin karnaa?", "Merhaba! Nasıl yardımcı olabiliriz?", "Вітаємо! Як ми можемо допомогти?"],
  intro: ["Pick one. It's quick and simple.", "Choisis une option. C'est simple et rapide.", "اختر واحدًا. الأمر سريع وبسيط.", "ሓደ ምረጹ። ቀልጢፉን ቀሊልን እዩ።", "یکی را انتخاب کنید. سریع و ساده است.", "یو یې وټاکئ. چټک او ساده دی.", "Mid dooro. Waa degdeg oo fudud.", "Birini seçin. Hızlı ve basit.", "Оберіть одне. Це швидко і просто."],
  "topic.prepare": ["Prepare my appointment", "Préparer mon rendez-vous", "التحضير لموعدي", "ቆጸራይ ምድላው", "آماده‌گی برای وقت ملاقاتم", "زما د لیدنې چمتووالی", "U diyaargarow ballantayda", "Randevuma hazırlanmak", "Підготуватися до прийому"],
  "topic.explain": ["Explain what is wrong", "Expliquer ce qui ne va pas", "اشرح ما المشكلة", "እንታይ ከም ዝሓመኩም ግለጹ", "توضیح دهید چه مشکلی دارید", "ووایاست چې څه ستونزه ده", "Sharax waxa ku dhibaya", "Neyin yanlış olduğunu anlat", "Пояснити, що не так"],
  "topic.healthcare": ["How healthcare works here", "Comment fonctionne la santé ici", "كيف تعمل الرعاية الصحية هنا", "ኣብዚ ክንክን ጥዕና ብኸመይ ይሰርሕ", "خدمات صحی اینجا چطور کار می‌کند", "دلته روغتیایي پاملرنه څنګه کار کوي", "Sida daryeelka caafimaadku halkan u shaqeeyo", "Burada sağlık sistemi nasıl işler", "Як тут працює медицина"],
  "topic.rights": ["My rights and my privacy", "Mes droits et ma vie privée", "حقوقي وخصوصيتي", "መሰለይን ብሕተይነተይን", "حقوق و حریم خصوصی من", "زما حقونه او محرمیت", "Xuquuqdayda iyo arrimahayga gaarka ah", "Haklarım ve gizliliğim", "Мої права та приватність"],
  soon: ["This page is coming soon.", "Cette page arrive bientôt.", "هذه الصفحة قادمة قريبًا.", "እዚ ገጽ ቀልጢፉ ክመጽእ እዩ።", "این صفحه به‌زودی می‌آید.", "دا پاڼه ډېر ژر راځي.", "Boggan dhawaan ayuu imanayaa.", "Bu sayfa yakında geliyor.", "Ця сторінка скоро з'явиться."],
  back: ["Back", "Retour", "رجوع", "ተመለስ", "برگشت", "شاته", "Dib u noqo", "Geri", "Назад"],
  close: ["Close", "Fermer", "إغلاق", "ዕጸው", "بستن", "بندول", "Xir", "Kapat", "Закрити"],
  switchRole: ["Switch role", "Changer de rôle", "تغيير الدور", "ተራ ቀይር", "تغییر نقش", "رول بدل کړئ", "Beddel doorka", "Rol değiştir", "Змінити роль"],
  emergency: ["In an emergency call 144 or 112.", "En cas d'urgence, appelle le 144 ou le 112.", "في حالة الطوارئ اتصل بالرقم 144 أو 112.", "ኣብ ህጹጽ ኩነታት ናብ 144 ወይ 112 ደውሉ።", "در حالت اضطراری با ۱۴۴ یا ۱۱۲ تماس بگیرید.", "په بیړني حالت کې ۱۴۴ یا ۱۱۲ ته زنګ ووهئ.", "Xaalad degdeg ah wac 144 ama 112.", "Acil durumda 144 veya 112'yi arayın.", "У надзвичайній ситуації телефонуйте 144 або 112."],
  noData: ["MedBridge does not store patient data.", "MedBridge ne conserve aucune donnée de patient.", "لا يخزّن MedBridge بيانات المرضى.", "MedBridge ሓበሬታ ሕሙማት ኣይዕቅብን።", "MedBridge معلومات بیماران را ذخیره نمی‌کند.", "MedBridge د ناروغانو معلومات نه ساتي.", "MedBridge ma kaydiyo xogta bukaanka.", "MedBridge hasta verilerini saklamaz.", "MedBridge не зберігає дані пацієнтів."],
  general: ["This tool gives general information. It does not replace a doctor and cannot diagnose.", "Cet outil donne des informations générales. Il ne remplace pas un médecin et ne peut pas poser de diagnostic.", "تقدّم هذه الأداة معلومات عامة. لا تحلّ محل الطبيب ولا يمكنها التشخيص.", "እዚ መሳርሒ ሓፈሻዊ ሓበሬታ ይህብ። ንሓኪም ኣይትክእን፡ ምርመራ ክገብር ኣይክእልን።", "این ابزار معلومات عمومی می‌دهد. جای داکتر را نمی‌گیرد و نمی‌تواند تشخیص بدهد.", "دا وسیله عمومي معلومات ورکوي. د ډاکټر ځای نه نیسي او تشخیص نشي کولای.", "Qalabkani wuxuu bixiyaa macluumaad guud. Ma beddelo dhakhtar mana ogaan karo cudur.", "Bu araç genel bilgi verir. Doktorun yerini tutmaz ve teşhis koyamaz.", "Цей інструмент дає загальну інформацію. Він не замінює лікаря і не може ставити діагноз."],
  placeholder: ["Placeholder — official wording will be added here later.", "Espace réservé — le texte officiel sera ajouté ici plus tard.", "نص مؤقت — ستتم إضافة الصياغة الرسمية هنا لاحقًا.", "ቦታ ዝሓዘ — ወግዓዊ ጽሑፍ ድሒሩ ኣብዚ ክውሰኽ እዩ።", "متن موقت — متن رسمی بعداً اینجا اضافه می‌شود.", "لنډمهاله متن — رسمي متن به وروسته دلته اضافه شي.", "Meel bannaan — qoraalka rasmiga ah ayaa halkan lagu dari doonaa hadhow.", "Yer tutucu — resmi metin daha sonra buraya eklenecek.", "Заповнювач — офіційний текст буде додано пізніше."],
  notChecked: ["Translation not yet checked by a speaker.", "Traduction pas encore vérifiée par un locuteur.", "لم يتم التحقق من الترجمة من قبل متحدث بعد.", "ትርጉም ገና ብተዛራቢ ቋንቋ ኣይተመርመረን።", "ترجمه هنوز توسط یک گوینده بررسی نشده است.", "ژباړه لا تر اوسه د ژبې د ویونکي لخوا نه ده کتل شوې.", "Turjumaadda weli lama hubin qof ku hadla.", "Çeviri henüz bir anadil konuşanı tarafından kontrol edilmedi.", "Переклад ще не перевірений носієм мови."],
  notCheckedInterp: ["Translation not yet checked by a speaker. Please confirm with an interpreter.", "Traduction pas encore vérifiée par un locuteur. Merci de confirmer avec un interprète.", "لم يتم التحقق من الترجمة من قبل متحدث بعد. يرجى التأكد مع مترجم.", "ትርጉም ገና ብተዛራቢ ቋንቋ ኣይተመርመረን። በጃኹም ምስ ተርጓሚ ኣረጋግጹ።", "ترجمه هنوز توسط یک گوینده بررسی نشده است. لطفاً با یک ترجمان تأیید کنید.", "ژباړه لا نه ده کتل شوې. مهرباني وکړئ له ژباړونکي سره یې تایید کړئ.", "Turjumaadda weli lama hubin. Fadlan ku xaqiiji turjumaan.", "Çeviri henüz kontrol edilmedi. Lütfen bir tercümanla doğrulayın.", "Переклад ще не перевірений. Будь ласка, уточніть у перекладача."],

  "topic.translate": ["Translate for me", "Traduire pour moi", "ترجم لي", "ተርጉመለይ", "برایم ترجمه کن", "زما لپاره وژباړه", "Ii turjun", "Benim için çevir", "Перекласти для мене"],

  // ---------- Translate for me ----------
  "tr.privacy": ["Do not write your name or personal details. Nothing is saved.", "N'écris pas ton nom ni tes données personnelles. Rien n'est enregistré.", "لا تكتب اسمك أو بياناتك الشخصية. لا يتم حفظ أي شيء.", "ስምኩም ወይ ውልቃዊ ሓበሬታኹም ኣይትጽሓፉ። ዋላ ሓንቲ ኣይዕቀብን።", "نام یا معلومات شخصی خود را ننویسید. هیچ چیزی ذخیره نمی‌شود.", "خپل نوم یا شخصي معلومات مه لیکئ. هیڅ شی نه ساتل کیږي.", "Ha qorin magacaaga ama xogtaada gaarka ah. Waxba lama kaydiyo.", "Adınızı veya kişisel bilgilerinizi yazmayın. Hiçbir şey kaydedilmez.", "Не пишіть своє ім'я чи особисті дані. Нічого не зберігається."],
  "tr.warning": ["Machine translation can be wrong. For important decisions, ask for an interpreter.", "La traduction automatique peut se tromper. Pour les décisions importantes, demande un interprète.", "قد تكون الترجمة الآلية خاطئة. للقرارات المهمة، اطلب مترجمًا.", "ማሽናዊ ትርጉም ጌጋ ክኸውን ይኽእል። ንኣገደስቲ ውሳኔታት ተርጓሚ ሕተቱ።", "ترجمه ماشینی ممکن است اشتباه باشد. برای تصمیم‌های مهم، ترجمان بخواهید.", "ماشیني ژباړه کېدای شي غلطه وي. د مهمو پرېکړو لپاره ژباړونکی وغواړئ.", "Turjumaadda mashiinku way khaldami kartaa. Go'aannada muhiimka ah, codso turjumaan.", "Makine çevirisi yanlış olabilir. Önemli kararlar için tercüman isteyin.", "Машинний переклад може бути помилковим. Для важливих рішень попросіть перекладача."],
  "tr.heard": ["What the doctor or nurse said", "Ce que le médecin ou l'infirmier a dit", "ما قاله الطبيب أو الممرض", "ሓኪም ወይ ነርስ ዝበሎ", "آنچه داکتر یا نرس گفت", "هغه څه چې ډاکټر یا نرس وویل", "Waxa dhakhtarku ama kalkaalisadu yidhi", "Doktorun veya hemşirenin söyledikleri", "Що сказав лікар або медсестра"],
  "tr.say": ["What I want to say", "Ce que je veux dire", "ما أريد أن أقوله", "ክብሎ ዝደሊ", "آنچه می‌خواهم بگویم", "هغه څه چې غواړم ووایم", "Waxa aan rabo inaan idhaahdo", "Söylemek istediğim", "Що я хочу сказати"],
  "tr.heardHint": ["Type or paste the text here, in French or any language.", "Écris ou colle le texte ici, en français ou dans une autre langue.", "اكتب أو الصق النص هنا، بالفرنسية أو بأي لغة.", "ጽሑፍ ኣብዚ ጽሓፉ ወይ ለጥፉ፡ ብፈረንሳይኛ ወይ ብዝኾነ ቋንቋ።", "متن را اینجا بنویسید یا بچسبانید، به فرانسوی یا هر زبانی.", "متن دلته ولیکئ یا یې پیسټ کړئ، په فرانسوي یا هره ژبه.", "Halkan ku qor ama ku dheji qoraalka, Faransiis ama luqad kasta.", "Metni buraya yazın veya yapıştırın, Fransızca veya herhangi bir dilde.", "Напишіть або вставте текст тут, французькою чи будь-якою мовою."],
  "tr.sayHint": ["Type here in your own language.", "Écris ici dans ta langue.", "اكتب هنا بلغتك.", "ኣብዚ ብቋንቋኹም ጽሓፉ።", "اینجا به زبان خودتان بنویسید.", "دلته په خپله ژبه ولیکئ.", "Halkan ku qor luqaddaada.", "Buraya kendi dilinizde yazın.", "Напишіть тут своєю мовою."],
  "tr.translate": ["Translate", "Traduire", "ترجم", "ተርጉም", "ترجمه کن", "وژباړه", "Turjun", "Çevir", "Перекласти"],
  "tr.translating": ["Translating…", "Traduction…", "جارٍ الترجمة…", "ይትርጎም ኣሎ…", "در حال ترجمه…", "ژباړل کیږي…", "Waa la turjumayaa…", "Çevriliyor…", "Перекладаємо…"],
  "tr.swap": ["Swap direction", "Inverser le sens", "عكس الاتجاه", "ኣንፈት ቀይር", "تغییر جهت", "لوری بدل کړئ", "Beddel jihada", "Yönü değiştir", "Змінити напрямок"],
  "tr.clear": ["Clear", "Effacer", "مسح", "ደምስስ", "پاک کردن", "پاکول", "Tirtir", "Temizle", "Очистити"],
  "tr.result": ["Translation", "Traduction", "الترجمة", "ትርጉም", "ترجمه", "ژباړه", "Turjumaad", "Çeviri", "Переклад"],
  "tr.couldNot": ["I could not translate this.", "Je n'ai pas pu traduire ce texte.", "لم أتمكن من ترجمة هذا.", "ነዚ ክትርጉሞ ኣይከኣልኩን።", "نتوانستم این را ترجمه کنم.", "دا مې ونشو ژباړلای.", "Tan ma turjumi karin.", "Bunu çeviremedim.", "Я не зміг(ла) це перекласти."],
  "tr.error": ["Translation is not available right now. Please try again later or ask for an interpreter.", "La traduction n'est pas disponible pour le moment. Réessaie plus tard ou demande un interprète.", "الترجمة غير متاحة الآن. حاول لاحقًا أو اطلب مترجمًا.", "ትርጉም ሕጂ ኣይርከብን። ድሒርኩም ፈትኑ ወይ ተርጓሚ ሕተቱ።", "ترجمه اکنون در دسترس نیست. بعداً دوباره امتحان کنید یا ترجمان بخواهید.", "ژباړه اوس شتون نه لري. وروسته بیا هڅه وکړئ یا ژباړونکی وغواړئ.", "Turjumaaddu hadda ma diyaarsana. Mar kale isku day ama codso turjumaan.", "Çeviri şu anda kullanılamıyor. Daha sonra tekrar deneyin veya tercüman isteyin.", "Переклад зараз недоступний. Спробуйте пізніше або попросіть перекладача."],
  "tr.askInterp": ["Ask for an interpreter", "Demander un interprète", "اطلب مترجمًا", "ተርጓሚ ሕተት", "ترجمان بخواهید", "ژباړونکی وغواړئ", "Codso turjumaan", "Tercüman iste", "Попросити перекладача"],
  // ---------- Prepare my appointment ----------
  "prepare.sub": ["Tick when it's ready. Nothing is sent anywhere.", "Coche quand c'est prêt. Rien n'est envoyé.", "ضع علامة عندما يكون جاهزًا. لا يُرسل أي شيء.", "ምስ ተዳለወ ምልክት ግበሩ። ዋላ ሓንቲ ኣይለኣኽን።", "وقتی آماده شد علامت بزنید. چیزی فرستاده نمی‌شود.", "کله چې چمتو شو نښه یې کړئ. هیڅ شی نه لیږل کیږي.", "Calaamadee marka uu diyaar yahay. Waxba lama diro.", "Hazır olunca işaretleyin. Hiçbir şey gönderilmez.", "Позначте, коли готово. Нічого нікуди не надсилається."],
  "prepare.bring": ["What to bring", "Ce que j'apporte", "ما يجب إحضاره", "እንታይ ከተምጽእ", "چه چیزی بیاورم", "څه راوړم", "Waxa la keenayo", "Yanınızda getirin", "Що взяти з собою"],
  "prepare.papers": ["Papers I was given", "Les papiers qu'on m'a donnés", "الأوراق التي أُعطيت لي", "ዝተዋህቡኒ ወረቐቲ", "کاغذهایی که به من داده شده", "هغه کاغذونه چې راکړل شوي", "Waraaqaha la i siiyay", "Bana verilen belgeler", "Документи, які мені дали"],
  "prepare.meds": ["A list of medicines I take", "La liste de mes médicaments", "قائمة بالأدوية التي أتناولها", "ዝርዝር ዝወስዶም መድሃኒታት", "فهرست داروهایی که می‌خورم", "د هغو درملو لیست چې اخلم یې", "Liiska daawooyinka aan qaato", "Kullandığım ilaçların listesi", "Список ліків, які я приймаю"],
  "prepare.card": ["My insurance card", "Ma carte d'assurance", "بطاقة التأمين الخاصة بي", "ካርድ ኢንሹራንሰይ", "کارت بیمه‌ام", "زما د بیمې کارت", "Kaarkayga caymiska", "Sigorta kartım", "Моя страхова картка"],
  "prepare.who": ["Who can come with me", "Qui peut venir avec moi", "من يمكنه مرافقتي", "መን ምሳይ ክመጽእ ይኽእል", "چه کسی می‌تواند با من بیاید", "څوک له ما سره راتلای شي", "Yaa ila iman kara", "Kim benimle gelebilir", "Хто може піти зі мною"],
  "prepare.companion": ["I can bring someone I trust.", "Je peux venir avec une personne de confiance.", "يمكنني إحضار شخص أثق به.", "ዝኣምኖ ሰብ ከምጽእ እኽእል እየ።", "می‌توانم کسی را که به او اعتماد دارم بیاورم.", "زه کولای شم یو باوري کس راوړم.", "Waan keeni karaa qof aan aaminsanahay.", "Güvendiğim birini getirebilirim.", "Я можу взяти людину, якій довіряю."],
  "prepare.interpTitle": ["I can ask for an interpreter", "Je peux demander un interprète", "يمكنني طلب مترجم", "ተርጓሚ ክሓትት እኽእል እየ", "می‌توانم ترجمان بخواهم", "زه کولای شم ژباړونکی وغواړم", "Waan codsan karaa turjumaan", "Tercüman isteyebilirim", "Я можу попросити перекладача"],
  "prepare.interp": ["I can ask for an interpreter. It is my right to understand.", "Je peux demander un interprète. J'ai le droit de comprendre.", "يمكنني طلب مترجم. من حقي أن أفهم.", "ተርጓሚ ክሓትት እኽእል እየ። ምርዳእ መሰለይ እዩ።", "می‌توانم ترجمان بخواهم. فهمیدن حق من است.", "زه کولای شم ژباړونکی وغواړم. پوهیدل زما حق دی.", "Waan codsan karaa turjumaan. Waa xaqayga inaan fahmo.", "Tercüman isteyebilirim. Anlamak benim hakkım.", "Я можу попросити перекладача. Я маю право розуміти."],
  "prepare.questions": ["Questions I can ask", "Questions que je peux poser", "أسئلة يمكنني طرحها", "ክሓቶም ዝኽእል ሕቶታት", "سؤال‌هایی که می‌توانم بپرسم", "هغه پوښتنې چې کولای شم یې وکړم", "Su'aalaha aan weydiin karo", "Sorabileceğim sorular", "Питання, які я можу поставити"],
  "prepare.q1": ["What is happening to me?", "Qu'est-ce qui m'arrive ?", "ماذا يحدث لي؟", "እንታይ ይገጥመኒ ኣሎ?", "چه اتفاقی برایم می‌افتد؟", "ما ته څه پېښیږي؟", "Maxaa igu dhacaya?", "Bana ne oluyor?", "Що зі мною відбувається?"],
  "prepare.q2": ["What do I need to do next?", "Que dois-je faire ensuite ?", "ماذا يجب أن أفعل بعد ذلك؟", "ቀጺለ እንታይ ክገብር ኣለኒ?", "بعد از این چه باید بکنم؟", "وروسته باید څه وکړم؟", "Maxaan sameeyaa marka xigta?", "Sonra ne yapmam gerekiyor?", "Що мені робити далі?"],
  "prepare.q3": ["Can you say it more simply?", "Pouvez-vous l'expliquer plus simplement ?", "هل يمكنك قولها بطريقة أبسط؟", "ብቐሊል ክትነግሩኒ ትኽእሉ ዶ?", "می‌توانید ساده‌تر بگویید؟", "ایا کولای شئ په ساده ډول یې ووایاست؟", "Si fudud ma ii sheegi kartaa?", "Daha basit söyleyebilir misiniz?", "Можете пояснити простіше?"],
  "prepare.q4": ["How long will this take?", "Combien de temps cela va-t-il prendre ?", "كم من الوقت سيستغرق هذا؟", "እዚ ክንደይ ግዜ ክወስድ እዩ?", "این چقدر طول می‌کشد؟", "دا به څومره وخت ونیسي؟", "Intee in le'eg ayay qaadan doontaa?", "Bu ne kadar sürecek?", "Скільки часу це займе?"],
  "prepare.q5": ["Do I need to come back?", "Est-ce que je dois revenir ?", "هل يجب أن أعود مرة أخرى؟", "ተመሊሰ ክመጽእ የድልየኒ ዶ?", "آیا باید دوباره بیایم؟", "ایا بیا راتلو ته اړتیا لرم؟", "Ma u baahanahay inaan soo noqdo?", "Tekrar gelmem gerekiyor mu?", "Чи потрібно мені прийти ще раз?"],
  "prepare.q6": ["Can I have an interpreter?", "Est-ce que je peux avoir un interprète ?", "هل يمكنني الحصول على مترجم؟", "ተርጓሚ ክረክብ ይኽእል ዶ?", "آیا می‌توانم ترجمان داشته باشم؟", "ایا کولای شم ژباړونکی ولرم؟", "Ma heli karaa turjumaan?", "Tercüman alabilir miyim?", "Чи можу я отримати перекладача?"],
  "prepare.showChosen": ["Show my chosen questions", "Montrer mes questions choisies", "أظهر أسئلتي المختارة", "ዝመረጽክዎም ሕቶታት ኣርእዩ", "سؤال‌های انتخابی‌ام را نشان بده", "زما ټاکل شوې پوښتنې وښایاست", "Tus su'aalaha aan doortay", "Seçtiğim soruları göster", "Показати мої вибрані питання"],
  "prepare.tickHint": ["Tick the circle to choose a question. Tap the text to show it large.", "Coche le cercle pour choisir une question. Touche le texte pour l'afficher en grand.", "ضع علامة في الدائرة لاختيار سؤال. اضغط على النص لعرضه بحجم كبير.", "ሕቶ ንምምራጽ ነቲ ክቢ ምልክት ግበሩ። ብዓቢ ንምርኣዩ ነቲ ጽሑፍ ጠውቑ።", "برای انتخاب سؤال، دایره را علامت بزنید. برای نمایش بزرگ، روی متن بزنید.", "د پوښتنې د ټاکلو لپاره دایره نښه کړئ. د لوی ښودلو لپاره متن ټک کړئ.", "Calaamadee goobada si aad su'aal u doorato. Taabo qoraalka si aad u weyneyso.", "Bir soru seçmek için daireyi işaretleyin. Büyük göstermek için metne dokunun.", "Позначте коло, щоб вибрати питання. Натисніть на текст, щоб показати його великим."],
  "next": ["Next", "Suivant", "التالي", "ቀጻሊ", "بعدی", "بل", "Xiga", "İleri", "Далі"],
  "previous": ["Previous", "Précédent", "السابق", "ዝሓለፈ", "قبلی", "مخکینی", "Hore", "Geri", "Назад"],

  // ---------- How healthcare works here ----------
  "hc.doctor": ["Family doctor", "Médecin de famille", "طبيب الأسرة", "ሓኪም ስድራ", "داکتر خانواده", "د کورنۍ ډاکټر", "Dhakhtarka qoyska", "Aile hekimi", "Сімейний лікар"],
  "hc.doctorText": ["Your family doctor is usually the first person to see.", "Ton médecin de famille est souvent la première personne à voir.", "طبيب الأسرة هو عادةً أول شخص تراه.", "ሓኪም ስድራኹም መብዛሕትኡ ግዜ ቀዳማይ እትርእይዎ ሰብ እዩ።", "داکتر خانواده معمولاً اولین کسی است که باید ببینید.", "د کورنۍ ډاکټر معمولاً لومړی کس دی چې باید ورته لاړ شئ.", "Dhakhtarka qoyska ayaa inta badan ah qofka ugu horreeya ee la arko.", "Aile hekiminiz genellikle ilk görmeniz gereken kişidir.", "Сімейний лікар — зазвичай перша людина, до якої варто звернутися."],
  "hc.pharmacy": ["Pharmacy", "Pharmacie", "الصيدلية", "ፋርማሲ", "دواخانه", "درملتون", "Farmashiye", "Eczane", "Аптека"],
  "hc.pharmacyText": ["A pharmacist can help with small health questions.", "Un pharmacien peut aider pour les petites questions de santé.", "يمكن للصيدلي المساعدة في الأسئلة الصحية البسيطة.", "ፋርማሲስት ኣብ ንኣሽቱ ሕቶታት ጥዕና ክሕግዝ ይኽእል።", "دواساز می‌تواند در سؤال‌های کوچک صحی کمک کند.", "درملپوه کولای شي په کوچنیو روغتیایي پوښتنو کې مرسته وکړي.", "Farmashiistaha wuxuu kaa caawin karaa su'aalaha yaryar ee caafimaadka.", "Eczacı küçük sağlık sorularında yardımcı olabilir.", "Фармацевт може допомогти з невеликими питаннями щодо здоров'я."],
  "hc.er": ["Emergency department", "Urgences", "قسم الطوارئ", "ክፍሊ ህጹጽ ረድኤት", "بخش عاجل", "بیړنۍ برخه", "Qaybta gurmadka degdegga", "Acil servis", "Відділення невідкладної допомоги"],
  "hc.erText": ["Go to the hospital emergency department only for serious problems.", "Va aux urgences de l'hôpital seulement pour les problèmes graves.", "اذهب إلى قسم الطوارئ في المستشفى فقط للمشاكل الخطيرة.", "ንከቢድ ጸገማት ጥራይ ናብ ክፍሊ ህጹጽ ረድኤት ሆስፒታል ኪዱ።", "فقط برای مشکلات جدی به بخش عاجل شفاخانه بروید.", "یوازې د جدي ستونزو لپاره د روغتون بیړنۍ برخې ته لاړ شئ.", "Qaybta gurmadka isbitaalka u tag oo keliya dhibaatooyin culus.", "Hastanenin acil servisine yalnızca ciddi sorunlar için gidin.", "Звертайтеся до відділення невідкладної допомоги лише з серйозними проблемами."],
  "hc.interp": ["Interpreter service", "Service d'interprétariat", "خدمة الترجمة", "ኣገልግሎት ትርጉም", "خدمات ترجمانی", "د ژباړې خدمت", "Adeegga turjumaanka", "Tercümanlık hizmeti", "Служба перекладачів"],
  "hc.interpText": ["An interpreter can help you and the doctor understand each other.", "Un interprète vous aide, toi et le médecin, à vous comprendre.", "يمكن للمترجم مساعدتك أنت والطبيب على فهم بعضكما.", "ተርጓሚ ንዓኹምን ንሓኪምን ክትረዳድኡ ክሕግዝ ይኽእል።", "ترجمان می‌تواند به شما و داکتر کمک کند همدیگر را بفهمید.", "ژباړونکی کولای شي له تاسو او ډاکټر سره مرسته وکړي چې یو بل ته پوه شئ.", "Turjumaan ayaa kaa caawin kara adiga iyo dhakhtarka inaad is fahantaan.", "Bir tercüman sizin ve doktorun birbirinizi anlamanıza yardımcı olabilir.", "Перекладач допоможе вам і лікарю зрозуміти одне одного."],
  "hc.links": ["Useful links", "Liens utiles", "روابط مفيدة", "ጠቓሚ መራኸቢታት", "لینک‌های مفید", "ګټور لینکونه", "Xiriirro faa'iido leh", "Faydalı bağlantılar", "Корисні посилання"],
  "hc.phone": ["National telephone interpreting service", "Interprétariat national par téléphone", "خدمة الترجمة الوطنية عبر الهاتف", "ሃገራዊ ኣገልግሎት ትርጉም ብተሌፎን", "خدمات ملی ترجمانی تلفنی", "ملي تلیفوني ژباړې خدمت", "Adeegga qaranka ee turjumaadda taleefanka", "Ulusal telefonla tercümanlık hizmeti", "Національна телефонна служба перекладу"],
  "hc.hours": ["Daily, 7:00 to 19:00.", "Tous les jours, 7:00 à 19:00.", "يوميًا، من 7:00 إلى 19:00.", "መዓልታዊ፡ 7:00 ክሳብ 19:00።", "هر روز، ۷:۰۰ تا ۱۹:۰۰.", "هره ورځ، ۷:۰۰ څخه تر ۱۹:۰۰.", "Maalin kasta, 7:00 ilaa 19:00.", "Her gün, 7:00 - 19:00.", "Щодня, з 7:00 до 19:00."],
  "hc.check": ["Check the hours on the official website:", "Vérifie les horaires sur le site officiel :", "تحقق من المواعيد على الموقع الرسمي:", "ሰዓታት ኣብ ወግዓዊ መርበብ ኣረጋግጹ፦", "ساعات را در وب‌سایت رسمی بررسی کنید:", "ساعتونه په رسمي ویب پاڼه کې وګورئ:", "Ka hubi saacadaha bogga rasmiga ah:", "Saatleri resmi web sitesinden kontrol edin:", "Перевірте години на офіційному сайті:"],

  // ---------- My rights and my privacy ----------
  "rights.rights": ["My rights", "Mes droits", "حقوقي", "መሰለይ", "حقوق من", "زما حقونه", "Xuquuqdayda", "Haklarım", "Мої права"],
  "rights.privacy": ["My privacy", "Ma vie privée", "خصوصيتي", "ብሕተይነተይ", "حریم خصوصی من", "زما محرمیت", "Arrimahayga gaarka ah", "Gizliliğim", "Моя приватність"],
  "rights.sources": ["Official sources", "Sources officielles", "مصادر رسمية", "ወግዓዊ ምንጭታት", "منابع رسمی", "رسمي سرچینې", "Ilo rasmi ah", "Resmi kaynaklar", "Офіційні джерела"],
  "rights.foph": ["Federal Office of Public Health (FOPH)", "Office fédéral de la santé publique (OFSP)", "", "", "", "", "", "", ""],
  "rights.fdpic": ["Federal Data Protection and Information Commissioner (FDPIC)", "Préposé fédéral à la protection des données et à la transparence (PFPDT)", "", "", "", "", "", "", ""],

  // ---------- Explain what is wrong ----------
  "explain.heading": ["Tap what you feel. Then show your phone to the doctor.", "Touche ce que tu ressens. Puis montre ton téléphone au médecin.", "اضغط على ما تشعر به. ثم أظهر هاتفك للطبيب.", "ዝስምዓኩም ጠውቑ። ድሕሪኡ ተሌፎንኩም ንሓኪም ኣርእዩ።", "روی چیزی که حس می‌کنید بزنید. بعد تلفن خود را به داکتر نشان دهید.", "هغه څه ټک کړئ چې احساسوئ یې. بیا خپل ټیلیفون ډاکټر ته وښایاست.", "Taabo waxa aad dareemayso. Kadib taleefankaaga tus dhakhtarka.", "Hissettiğinize dokunun. Sonra telefonunuzu doktora gösterin.", "Натисніть, що ви відчуваєте. Потім покажіть телефон лікарю."],
  "sym.headache": ["Headache", "Mal de tête", "صداع", "ሕማም ርእሲ", "سردرد", "سر درد", "Madax xanuun", "Baş ağrısı", "Головний біль"],
  "sym.stomach": ["Stomach pain", "Mal au ventre", "ألم في البطن", "ሕማም ከብዲ", "دل‌درد", "د خېټې درد", "Calool xanuun", "Karın ağrısı", "Біль у животі"],
  "sym.cough": ["Cough", "Toux", "سعال", "ሰዓል", "سرفه", "ټوخی", "Qufac", "Öksürük", "Кашель"],
  "sym.fever": ["Fever", "Fièvre", "حمّى", "ረስኒ", "تب", "تبه", "Qandho", "Ateş", "Температура"],
  "sym.tired": ["Tired", "Fatigué(e)", "تعب", "ድኻም", "خسته", "ستړی", "Daal", "Yorgun", "Втома"],
  "sym.sleep": ["Cannot sleep", "Difficultés à dormir", "لا أستطيع النوم", "ድቃስ ኣይመጸንን", "خوابم نمی‌برد", "خوب نه راځي", "Ma seexan karo", "Uyuyamıyorum", "Не можу спати"],
  "sym.sad": ["Feeling very sad", "Très triste", "حزن شديد", "ብጣዕሚ ጓሂ", "خیلی غمگین", "ډېر خفه", "Murugo badan", "Çok üzgün", "Дуже сумно"],
  "sym.worried": ["Feeling very worried", "Très inquiet(ète)", "قلق شديد", "ብጣዕሚ ሻቕሎት", "خیلی نگران", "ډېر اندېښمن", "Walwal badan", "Çok endişeli", "Дуже тривожно"],
  "sym.chest": ["Pain in the chest", "Douleur dans la poitrine", "ألم في الصدر", "ቃንዛ ኣብ ኣፍ ልቢ", "درد در قفسه سینه", "د سینې درد", "Xanuun xabadka ah", "Göğüs ağrısı", "Біль у грудях"],
  "sym.breathing": ["Difficulty breathing", "Difficulté à respirer", "صعوبة في التنفس", "ጸገም ምስትንፋስ", "مشکل در نفس کشیدن", "په ساه اخیستلو کې ستونزه", "Neefsasho adag", "Nefes almakta zorluk", "Важко дихати"],
  "sym.back": ["Pain in the back", "Mal au dos", "ألم في الظهر", "ቃንዛ ሕቖ", "کمردرد", "د ملا درد", "Dhabar xanuun", "Sırt ağrısı", "Біль у спині"],
  "sym.skin": ["Skin problem", "Problème de peau", "مشكلة في الجلد", "ጸገም ቆርበት", "مشکل پوست", "د پوستکي ستونزه", "Dhibaato maqaarka ah", "Cilt sorunu", "Проблема зі шкірою"],
  "q.since": ["Since when?", "Depuis quand ?", "منذ متى؟", "ካብ መዓስ?", "از چه وقت؟", "له کله راهیسې؟", "Goorma ayuu bilaabmay?", "Ne zamandan beri?", "Відколи?"],
  "q.strength": ["How strong?", "À quel point ?", "ما مدى شدته؟", "ክንደይ ይበርትዕ?", "چقدر شدید است؟", "څومره سخت؟", "Intee buu le'eg yahay?", "Ne kadar şiddetli?", "Наскільки сильно?"],
  "q.where": ["Where?", "Où ?", "أين؟", "ኣበይ?", "کجا؟", "چېرته؟", "Halkee?", "Nerede?", "Де?"],
  "q.showDoctor": ["Show this to the doctor", "Montrer au médecin", "أظهر هذا للطبيب", "ነዚ ንሓኪም ኣርእዮ", "این را به داکتر نشان دهید", "دا ډاکټر ته وښایاست", "Tan u tus dhakhtarka", "Bunu doktora gösterin", "Покажіть це лікарю"],
  "since.today": ["Today", "Aujourd'hui", "اليوم", "ሎሚ", "امروز", "نن", "Maanta", "Bugün", "Сьогодні"],
  "since.days": ["A few days", "Quelques jours", "بضعة أيام", "ቁሩብ መዓልታት", "چند روز", "څو ورځې", "Dhowr maalmood", "Birkaç gün", "Кілька днів"],
  "since.week": ["About a week", "Environ une semaine", "حوالي أسبوع", "ኣስታት ሓደ ሰሙን", "حدود یک هفته", "شاوخوا یوه اونۍ", "Qiyaastii hal toddobaad", "Yaklaşık bir hafta", "Близько тижня"],
  "since.weeks": ["Several weeks", "Plusieurs semaines", "عدة أسابيع", "ብዙሓት ሰሙናት", "چند هفته", "څو اونۍ", "Dhowr toddobaad", "Birkaç hafta", "Кілька тижнів"],
  "since.months": ["Months or more", "Des mois ou plus", "أشهر أو أكثر", "ኣዋርሕ ወይ ልዕሊኡ", "چند ماه یا بیشتر", "میاشتې یا ډېر", "Bilo ama ka badan", "Aylar veya daha fazla", "Місяці або довше"],
  "scale.low": ["A little", "Un peu", "قليلًا", "ቁሩብ", "کمی", "لږ", "Wax yar", "Biraz", "Трохи"],
  "scale.high": ["Very strong", "Très fort", "قوي جدًا", "ብጣዕሚ ብርቱዕ", "خیلی شدید", "ډېر سخت", "Aad u xoog badan", "Çok şiddetli", "Дуже сильно"],
  "where.sub": ["Tap the place on the body.", "Touche l'endroit sur le corps.", "اضغط على المكان في الجسم.", "ነቲ ቦታ ኣብ ኣካል ጠውቑ።", "روی جای آن در بدن بزنید.", "په بدن کې هغه ځای ټک کړئ.", "Taabo meesha jirka.", "Vücuttaki yere dokunun.", "Натисніть на місце на тілі."],
  "body.head": ["Head", "Tête", "الرأس", "ርእሲ", "سر", "سر", "Madax", "Baş", "Голова"],
  "body.chest": ["Chest", "Poitrine", "الصدر", "ኣፍ ልቢ", "سینه", "سینه", "Xabad", "Göğüs", "Груди"],
  "body.belly": ["Belly", "Ventre", "البطن", "ከብዲ", "شکم", "خېټه", "Calool", "Karın", "Живіт"],
  "body.arm": ["Arm", "Bras", "الذراع", "ቅልጽም", "بازو", "لاس", "Gacan", "Kol", "Рука"],
  "body.leg": ["Leg", "Jambe", "الساق", "እግሪ", "پا", "پښه", "Lug", "Bacak", "Нога"],
  secondLang: ["Space for a second language", "Espace pour une deuxième langue", "", "", "", "", "", "", ""],
} as const satisfies Record<string, Row>;

export type PatientKey = keyof typeof TABLE;

/** Text in the chosen language; falls back to English when a cell is empty. Never blank. */
export function translate(key: PatientKey, lang: PatientLang): string {
  const row: Row = TABLE[key];
  return row[COLUMNS.indexOf(lang)] || row[0];
}

export function isPatientLang(v: unknown): v is PatientLang {
  return typeof v === "string" && (PATIENT_LANGS as readonly string[]).includes(v);
}
