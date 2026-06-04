const i18n = {
  ms: {
    splash_sub: "Selamat datang ke Bimgo", auth_title: "Selamat Datang", auth_sub: "Belajar Bahasa Isyarat Malaysia dengan AI.",
    auth_g_text: "Teruskan dengan Google", auth_a_text: "Teruskan dengan Apple", auth_or: "ATAU", auth_email_btn: "✉️ Teruskan dengan E-mel", email_hub_title: "Log Masuk E-mel",
    auth_reg: "🌟 Daftar Akaun Baru", auth_log: "Log Masuk", reg_title: "Daftar", lbl_email: "E-mel", lbl_pass: "Kata Laluan", lbl_pass2: "Sahkan Kata Laluan", btn_next: "Seterusnya →",
    log_title: "Log Masuk", wb_title: "Selamat kembali,", home_welcome: "Selamat datang,", home_target: "Sasaran Harian", home_ch_title: "Bab Pembelajaran",
    nav_home: "Utama", nav_prof: "Profil", prof_title: "Profil Saya", prof_edit_btn: "✏️ Sunting Profil", tab_stat: "📊 Statistik", tab_badge: "🏅 Lencana", tab_rank: "🏆 Ranking", prof_logout: "Log Keluar",
    edit_title: "Sunting Profil", edit_lbl1: "Nama Pengguna", edit_lbl2: "Pilih Avatar Baru", edit_lbl3: "Pilih Bahasa", edit_save: "Simpan Perubahan ✅",
    ch1: "Abjad", ch2: "Salam", ch3: "Kehidupan", ch4: "Kecemasan",
    les_theory: "Sesi Pembelajaran", les_watch: "Tonton demonstrasi di bawah.", les_visual: "Demonstrasi Visual", les_link: "Semak di BIM Sign Bank", les_cam: "Cuba Kamera AI 📷",
    cam_title: "Cabaran AI", cam_show: "Tunjukkan:", cam_acc: "Ketepatan Semasa", cam_open: "📷 Buka Kamera", cam_submit: "Hantar Jawapan", cam_ready: "Sila tunjukkan tangan...", cam_load: "Memuatkan AI...",
    cam_correct: "✅ Bentuk Tepat! Anda boleh hantar.", cam_wrong: "❌ Bentuk Belum Tepat. Betulkan kedudukan.", res_congrats: "Tahniah!", res_correct: "Tanda berjaya direkodkan.", res_lvldone: "Tahap selesai. +XP Ditambah!",
    res_next: "Teruskan Pembelajaran →", res_home: "Kembali ke Utama", res_tryagain: "Cuba Lagi!", res_below: "Ketepatan di bawah 85%. Teruskan latihan!", res_retrybtn: "Cuba Sekali Lagi",
    stat_totalxp: "Jumlah Keseluruhan XP", stat_lvldone: "tahap selesai", you: "Anda",
    err_mismatch: "⚠️ Kata laluan tidak sepadan!", err_exists: "⚠️ E-mel wujud!", err_notfound: "❌ Akaun tidak dijumpai.", err_wrongpass: "❌ Kata Laluan salah.", err_req: "Sila masukkan nama!",
    auth_loading: "Memuatkan...", res_acc: "Ketepatan Purata",
    quiz_title: "Kuiz Kemahiran", quiz_q: "Pilih jawapan yang betul:", quiz_pass: "Lulus Kuiz!", quiz_fail: "Belum Lulus", quiz_req: "Perlu sekurang-kurangnya 6/8.", quiz_score: "Markah Kuiz"
  },
  en: {
    splash_sub: "Welcome to Bimgo", auth_title: "Welcome", auth_sub: "Learn Malaysian Sign Language with AI.",
    auth_g_text: "Continue with Google", auth_a_text: "Continue with Apple", auth_or: "OR", auth_email_btn: "✉️ Continue with Email", email_hub_title: "Email Login",
    auth_reg: "🌟 Register New Account", auth_log: "Login", reg_title: "Register", lbl_email: "Email", lbl_pass: "Password", lbl_pass2: "Confirm Password", btn_next: "Next →",
    log_title: "Login", wb_title: "Welcome back,", home_welcome: "Welcome,", home_target: "Daily Goal", home_ch_title: "Learning Chapters",
    nav_home: "Home", nav_prof: "Profile", prof_title: "My Profile", prof_edit_btn: "✏️ Edit Profile", tab_stat: "📊 Statistics", tab_badge: "🏅 Badges", tab_rank: "🏆 Ranking", prof_logout: "Logout",
    edit_title: "Edit Profile", edit_lbl1: "Username", edit_lbl2: "Choose New Avatar", edit_lbl3: "Select Language", edit_save: "Save Changes ✅",
    ch1: "Alphabet", ch2: "Greetings", ch3: "Daily Life", ch4: "Emergency",
    les_theory: "Learning Session", les_watch: "Watch the demonstration below.", les_visual: "Visual Demonstration", les_link: "Check BIM Sign Bank", les_cam: "Try AI Camera 📷",
    cam_title: "AI Challenge", cam_show: "Show:", cam_acc: "Current Accuracy", cam_open: "📷 Open Camera", cam_submit: "Submit Answer", cam_ready: "Please show your hand...", cam_load: "Loading AI...",
    cam_correct: "✅ Accurate Shape! You can submit.", cam_wrong: "❌ Inaccurate Shape. Fix your position.", res_congrats: "Congratulations!", res_correct: "Sign successfully recorded.", res_lvldone: "Level complete. +XP Added!",
    res_next: "Continue Learning →", res_home: "Back to Home", res_tryagain: "Try Again!", res_below: "Accuracy below 85%. Keep practicing!", res_retrybtn: "Try One More Time",
    stat_totalxp: "Total XP Earned", stat_lvldone: "levels completed", you: "You",
    err_mismatch: "⚠️ Passwords do not match!", err_exists: "⚠️ Email already exists!", err_notfound: "❌ Account not found.", err_wrongpass: "❌ Incorrect password.", err_req: "Name required!",
    auth_loading: "Loading...", res_acc: "Average Accuracy",
    quiz_title: "Mastery Quiz", quiz_q: "Select the correct answer:", quiz_pass: "Quiz Passed!", quiz_fail: "Not Passed", quiz_req: "Need at least 6/8 to pass.", quiz_score: "Quiz Score"
  }
};

const CHAPTERS = [
  {
    id: 1, dictKey: "ch1", subtitle: "A-Z", icon: "🔤", color: "#4CAF50",
    levels: [
      { id: "1-1", title: "Letters A – E", signs: ["A", "B", "C", "D", "E"], xp: 500, gifSrc: "" },
      { id: "1-2", title: "Letters F – J", signs: ["F", "G", "H", "I", "J"], xp: 500, gifSrc: "" },
      { id: "1-3", title: "Letters K – O", signs: ["K", "L", "M", "N", "O"], xp: 500, gifSrc: "" },
      { id: "1-4", title: "Letters P – T", signs: ["P", "Q", "R", "S", "T"], xp: 500, gifSrc: "" },
      { id: "1-5", title: "Letters U – Z", signs: ["U", "V", "W", "X", "Y", "Z"], xp: 500, gifSrc: "" },
      { id: "1-q", title: "Mastery Quiz", isQuiz: true, xp: 1000 }
    ]
  },
  {
    id: 2, dictKey: "ch2", subtitle: "Greetings", icon: "👋", color: "#2196F3",
  levels: [
      { id: "2-1", title: "The Basics", signs: ["Hello", "Bye"], xp: 500, gifSrc: "" },
      { id: "2-2", title: "Politeness", signs: ["Thank you", "You're Welcome"], xp: 500, gifSrc: "" },
      { id: "2-3", title: "Apologies", signs: ["Sorry", "Excuse Me", "It's Okay"], xp: 500, gifSrc: "" },
      { id: "2-4", title: "Introductions", signs: ["My name is", "How are you?", "I am fine"], xp: 500, gifSrc: "" },
      { id: "2-5", title: "Farewells & Well Wish", signs: ["See you later", "Nice to meet you", "Good luck"], xp: 500, gifSrc: "" },
      { id: "2-q", title: "Mastery Quiz", isQuiz: true, xp: 1000 }
    ]
  },
  {
    id: 3, dictKey: "ch3", subtitle: "Daily Life", icon: "🏠", color: "#FF9800",
    levels: [
      { id: "3-1", title: "Core Family", signs: ["Mother", "Father", "Brother", "Sister"], xp: 500, gifSrc: "" },
      { id: "3-2", title: "Basic Needs", signs: ["Eat", "Drink", "Water", "Food"], xp: 500, gifSrc: "" },
      { id: "3-3", title: "Locations", signs: ["Home", "Work", "School", "Toilet"], xp: 500, gifSrc: "" },
      { id: "3-4", title: "Common Action", signs: ["Go", "Stop", "Want", "Need"], xp: 500, gifSrc: "" },
      { id: "3-5", title: "Time & Routine", signs: ["Today", "Tomorrow", "Now", "Later"], xp: 500, gifSrc: "" },
      { id: "3-q", title: "Mastery Quiz", isQuiz: true, xp: 1000 }
    ]
  },
  {
    id: 4, dictKey: "ch4", subtitle: "Emergency", icon: "🆘", color: "#F44336",
    levels: [
      { id: "4-1", title: "Immediate Alerts", signs: ["Help", "Stop", "Danger"], xp: 500, gifSrc: "" },
      { id: "4-2", title: "Medical Needs", signs: ["Pain", "Sick", "Hospital", "Doctor"], xp: 500, gifSrc: "" },
      { id: "4-3", title: "Security & Safety", signs: ["Police", "Thief", "Lost"], xp: 500, gifSrc: "" },
      { id: "4-4", title: "Urgent Action", signs: ["Call 999", "Need Help Now"], xp: 500, gifSrc: "" },
      { id: "4-5", title: "Specific Hazards", signs: ["Fire", "Accident", "Bleeding", "Allergy"], xp: 500, gifSrc: "" },
      { id: "4-q", title: "Mastery Quiz", isQuiz: true, xp: 1000 }
    ]
  }
];

const SIGN_MEDIA = {
    "Hello": "./assets/Hello.mp4",
    "Bye": "./assets/Good Bye.mp4",
    "Thank you": "./assets/Thank you.mp4",
    "You're Welcome": "./assets/Welcome.mp4",
    "A": "./assets/A.mp4",
    "B": "./assets/B.mp4",
    "C": "./assets/C.mp4",
    "D": "./assets/D.mp4",
    "E": "./assets/E.mp4",
    "Good Morning": "./assets/Good Morning.mp4",
    "Good Night": "./assets/Good Night.mp4",
    "Mother": "./assets/Mother.mp4",
    "Father": "./assets/Father.mp4",
    "Brother": "./assets/Brother.mp4",
    "Sister": "./assets/Sister.mp4",
    "Help": "./assets/Help.mp4",
    "Stop": "./assets/Stop.mp4",
    "Danger": "./assets/Danger.mp4"
};

const AVATARS=["🦁","🐯","🦊","🐼","🐨","🦋","🦜","🐬"];
let mockDB = gs("bimgo_users", {}); 
let activeSessionEmail = gs("bimgo_session", null); 
let progress = {}; 
let profile=null, tempSignupEmail="", tempSignupPass="", setupStep=0, setupData={username:"", avatar:"🦁", goal:10, lang:'ms'}, editTempAvatar = "", editTempLang = "ms"; 
let currentChapter=null, currentLevel=null, currentSignIdx=0, allLessonSigns=[], profileTab="stats";

let mpHands = null, mpCamera = null, isCameraRunning = false, currentScore = 0;
let sessionAccuracies = [];
let wristHistory = []; 

let quizQuestions = [];
let currentQuizIdx = 0;
let quizScore = 0;
let holdTimer = 3;
let holdInterval = null;
let learningInterval = null;

function gs(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function t(key) { const l = profile ? (profile.lang || 'ms') : setupData.lang; return i18n[l][key] || key; }