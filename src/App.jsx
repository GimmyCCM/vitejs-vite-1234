import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// 🎨 內建圖示區 (取代 lucide-react，免安裝套件)
// ----------------------------------------------------------------------
const Volume2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const Heart = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const Trash2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const BookOpen = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const Library = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>;
const Loader2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const Search = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const RotateCcw = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const Check = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>;
const ChevronLeft = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>;

// ----------------------------------------------------------------------
// 🔧 第一階段：Firebase 設定區 
// ----------------------------------------------------------------------
const myFirebaseConfig = {
  apiKey: "AIzaSyBPOiojivULTIprv9ouUUZZfdBKXoLXQzc",
  authDomain: "ccm-test-10b4a.firebaseapp.com",
  projectId: "ccm-test-10b4a",
  storageBucket: "ccm-test-10b4a.firebasestorage.app",
  messagingSenderId: "802097180518",
  appId: "1:802097180518:web:b37eecd3f70551d49662a7",
  measurementId: "G-Y34J6E5SP3"
};

// --- 以下為系統自動處理 Firebase 初始化的程式碼 ---
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : myFirebaseConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'killer-cards-app';

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase 初始化失敗:", error);
}

// ----------------------------------------------------------------------
// 🚀 第二階段：App 主程式 (Killer Cards)
// ----------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState('study'); 
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // 新增：用於控制目前顯示哪一張卡片 (一頁一張模式)
  const [studyCardIndex, setStudyCardIndex] = useState(0);
  const [bankCardIndex, setBankCardIndex] = useState(0);

  // 1. Firebase 身分驗證
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("登入失敗:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. 監聽 Firebase 單字庫
  useEffect(() => {
    if (!user || !db) return;
    const cardsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'savedWords');
    const unsubscribe = onSnapshot(
      cardsRef, 
      (snapshot) => {
        const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedCards(fetchedCards.reverse());
        // 如果刪除卡片導致目前索引超出範圍，則自動往前調整
        setBankCardIndex(prev => prev >= fetchedCards.length ? Math.max(0, fetchedCards.length - 1) : prev);
      },
      (error) => console.error("讀取單字庫失敗:", error)
    );
    return () => unsubscribe();
  }, [user]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 3. 呼叫 Gemini API 生成單字卡 (防白屏崩潰版)
  const generateWords = async () => {
    if (!topic.trim()) {
      showError("請輸入你想學習的主題！(例如：機場、咖啡廳、商用英文)");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setCards([]);
    setStudyCardIndex(0); // 重置輪播圖索引

    const promptText = `
      請身為一個專業的語言老師，幫我生成 5 個與「${topic}」相關的外語單字。
      如果是中文母語者學習，請優先提供「英文」或該主題最適合的語言。
      
      請嚴格以 JSON 格式回傳，必須是一個 Array，裡面包含 5 個 Object。
      每個 Object 必須包含以下 Key：
      - "word": 外語單字
      - "pinyin": 拼音或音標 (如 KK 音標)
      - "translation": 繁體中文翻譯
      - "example": 一句包含該單字的實用外語例句及中文翻譯
      - "memoryTrick": 一個好記的諧音記憶法、或是字根字首拆解
      
      不要包含任何 Markdown 標記，只要純 JSON 字串。
    `;

    let retries = 5;
    let delays = [1000, 2000, 4000, 8000, 16000];

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText })
        });

        // 讀取原始文字，避免非 JSON 格式導致解析崩潰 (白屏主因)
        const responseText = await response.text();
        let result;
        
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("伺服器回傳格式錯誤，請確定後端已正確設定。");
        }

        if (!response.ok) {
          throw new Error(result.error?.message || `API 請求失敗 (${response.status})`);
        }
        
        let jsonText = "";
        if (result.candidates && result.candidates[0].content) {
            jsonText = result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("AI 回傳的資料結構不符預期");
        }
        
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let generatedCards;
        try {
          generatedCards = JSON.parse(jsonText);
        } catch (e) {
          throw new Error("無法解析 AI 回傳的單字資料。");
        }

        if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
          throw new Error("生成的單字卡為空，請換個主題試試。");
        }
        
        setCards(generatedCards);
        setLoading(false);
        return; 
      } catch (err) {
        console.error("生成錯誤:", err);
        if (i === retries - 1) {
          showError("生成失敗：" + err.message);
          setLoading(false);
        } else {
          await sleep(delays[i]); 
        }
      }
    }
  };

  // 4. 儲存單字卡到 Firebase
  const saveCard = async (card) => {
    if (!user || !db) return;
    try {
      const cardsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'savedWords');
      await addDoc(cardsRef, { ...card, savedAt: new Date().toISOString() });
      showSuccess(`已將 "${card.word}" 存入單字庫！`);
    } catch (err) {
      showError("收藏失敗: " + err.message);
    }
  };

  // 5. 從 Firebase 刪除單字卡
  const deleteCard = async (id, word) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'savedWords', id);
      await deleteDoc(docRef);
      showSuccess(`已移除 "${word}"。`);
    } catch (err) {
      showError("刪除失敗: " + err.message);
    }
  };

  // 6. 語音朗讀功能 (加入 Android/小米 瀏覽器修復機制)
  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      try {
        // 先強制取消當前的語音，解決 Android 容易卡死的問題
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; 
        utterance.rate = 0.9; // 稍微放慢一點點聽得更清楚
        
        // 嘗試抓取系統可用語音，提升相容性
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
           const engVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en_US'));
           if (engVoice) utterance.voice = engVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        showError("語音播放發生錯誤，請檢查系統音量。");
      }
    } else {
      showError("您的瀏覽器不支援語音朗讀功能。");
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const isCardSaved = (word) => savedCards.some(card => card.word === word);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Killer Cards</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveTab('study')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'study' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">學習區</span>
              </button>
              <button 
                onClick={() => setActiveTab('bank')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'bank' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <Library className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">單字庫</span>
                {savedCards.length > 0 && (
                  <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {savedCards.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {errorMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-5 py-3 rounded-full shadow-lg z-50 animate-bounce w-[90%] max-w-sm text-center text-sm font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-5 py-3 rounded-full shadow-lg z-50 flex items-center justify-center w-[90%] max-w-sm text-sm font-medium">
          <Check className="w-4 h-4 mr-2 flex-shrink-0" /> {successMsg}
        </div>
      )}

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col">
        {activeTab === 'study' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 w-full">
              <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">召喚專屬單字卡</h2>
              
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateWords()}
                  placeholder="輸入主題 (例如：機場點餐)" 
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                />
                <button 
                  onClick={generateWords}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 生成中...</>
                  ) : (
                    <><Search className="w-5 h-5 mr-2" /> 生成卡片</>
                  )}
                </button>
              </div>
            </div>

            {/* 手機版：單張卡片輪播模式 */}
            {cards.length > 0 && (
              <div className="flex flex-col items-center justify-center flex-1 w-full">
                <div className="w-full">
                  <FlashCard 
                    card={cards[studyCardIndex]} 
                    onSpeak={speakWord} 
                    onAction={() => saveCard(cards[studyCardIndex])} 
                    actionIcon={<Heart className={`w-5 h-5 ${isCardSaved(cards[studyCardIndex].word) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />}
                    actionTooltip={isCardSaved(cards[studyCardIndex].word) ? "已收藏" : "收藏"}
                    isSaved={isCardSaved(cards[studyCardIndex].word)}
                  />
                </div>
                
                {/* 輪播控制鈕 */}
                <div className="flex items-center justify-between w-full mt-6 px-2">
                  <button 
                    onClick={() => setStudyCardIndex(prev => Math.max(0, prev - 1))}
                    disabled={studyCardIndex === 0}
                    className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-slate-500 font-medium tracking-wide">
                    {studyCardIndex + 1} / {cards.length}
                  </span>
                  <button 
                    onClick={() => setStudyCardIndex(prev => Math.min(cards.length - 1, prev + 1))}
                    disabled={studyCardIndex === cards.length - 1}
                    className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-800">我的專屬單字庫</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
                共 {savedCards.length} 個
              </span>
            </div>

            {savedCards.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center">
                <Library className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600">單字庫空空如也</h3>
                <p className="text-slate-500 mt-2 text-sm">快到「學習區」生成並收藏單字吧！</p>
                <button 
                  onClick={() => setActiveTab('study')}
                  className="mt-6 text-indigo-600 font-medium hover:text-indigo-800 flex items-center justify-center mx-auto text-sm"
                >
                  前往學習區 <RotateCcw className="w-4 h-4 ml-1" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 w-full">
                 <div className="w-full">
                  <FlashCard 
                    card={savedCards[bankCardIndex]} 
                    onSpeak={speakWord} 
                    onAction={() => deleteCard(savedCards[bankCardIndex].id, savedCards[bankCardIndex].word)} 
                    actionIcon={<Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />}
                    actionTooltip="移除"
                  />
                 </div>

                 {/* 輪播控制鈕 */}
                 <div className="flex items-center justify-between w-full mt-6 px-2">
                  <button 
                    onClick={() => setBankCardIndex(prev => Math.max(0, prev - 1))}
                    disabled={bankCardIndex === 0}
                    className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-slate-500 font-medium tracking-wide">
                    {bankCardIndex + 1} / {savedCards.length}
                  </span>
                  <button 
                    onClick={() => setBankCardIndex(prev => Math.min(savedCards.length - 1, prev + 1))}
                    disabled={bankCardIndex === savedCards.length - 1}
                    className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🃏 獨立組件：3D 翻轉單字卡 (FlashCard) - 高度已針對手機優化
// ----------------------------------------------------------------------
function FlashCard({ card, onSpeak, onAction, actionIcon, actionTooltip, isSaved }) {
  const encodedPrompt = encodeURIComponent(`Minimalist clean illustration of ${card.word}, vector art, white background`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=300&nologo=true`;

  return (
    // 將卡片高度調整為 h-[420px]，適應 6.5 吋手機螢幕比例
    <div className="relative w-full h-[420px] max-w-sm mx-auto [perspective:1000px] group cursor-pointer" onClick={(e) => {
        // 在手機上點擊卡片時觸發翻轉，阻止事件冒泡以免干擾內部按鈕
        e.currentTarget.querySelector('.card-inner').classList.toggle('[transform:rotateY(180deg)]');
    }}>
      <div className="card-inner w-full h-full transition-transform duration-700 [transform-style:preserve-3d] relative md:group-hover:[transform:rotateY(180deg)]">
        
        {/* --- 卡片正面 --- */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="h-[55%] w-full bg-slate-100 relative overflow-hidden shrink-0">
             <img src={imageUrl} alt={card.word} className="w-full h-full object-cover" loading="lazy" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             <button 
                onClick={(e) => { e.stopPropagation(); onSpeak(card.word); }}
                className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-3 rounded-full transition-all active:scale-90"
                title="發音"
             >
                <Volume2 className="w-6 h-6" />
             </button>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{card.word}</h3>
            <p className="text-slate-500 font-medium mt-2 text-lg">{card.pinyin}</p>
            <div className="mt-4 flex items-center text-sm text-indigo-500 font-medium opacity-70">
              <RotateCcw className="w-4 h-4 mr-1" /> 點擊翻轉卡片
            </div>
          </div>
        </div>

        {/* --- 卡片背面 --- */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-800 text-slate-50 rounded-2xl shadow-xl p-6 flex flex-col overflow-y-auto border-t-4 border-indigo-500">
           <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-4 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">{card.translation}</h3>
                <p className="text-slate-400 text-sm mt-1">{card.word} • {card.pinyin}</p>
              </div>
              <button 
                 onClick={(e) => { e.stopPropagation(); onAction(); }}
                 disabled={isSaved} 
                 className="group/btn bg-slate-700 hover:bg-slate-600 p-3 rounded-full transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                 title={actionTooltip}
              >
                 {actionIcon}
              </button>
           </div>
           <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">📝 實用例句</div>
                <p className="text-slate-200 text-[15px] leading-relaxed">{card.example}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">💡 記憶法 / 拆解</div>
                <p className="text-slate-300 text-[15px] leading-relaxed">{card.memoryTrick}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}