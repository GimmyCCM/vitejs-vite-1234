import React, { useState } from 'react';

// ----------------------------------------------------------------------
// 🎨 內建圖示區 (僅保留使用到的圖示，免安裝套件)
// ----------------------------------------------------------------------
const Volume2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const BookOpen = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const Loader2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const Search = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const RotateCcw = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const ChevronLeft = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>;

// ----------------------------------------------------------------------
// 🚀 App 主程式 (純淨生成器版，無單字庫)
// ----------------------------------------------------------------------
export default function App() {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [studyCardIndex, setStudyCardIndex] = useState(0);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 顯示錯誤訊息 (自動隱藏)
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // 靜默喚醒語音引擎 (解決 Android/小米 等瀏覽器必須有使用者互動才能發聲的限制)
  const unlockAudioEngine = () => {
    if ('speechSynthesis' in window) {
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.volume = 0; // 靜音播放
      window.speechSynthesis.speak(silentUtterance);
    }
  };

  // 呼叫 API 生成單字卡 (終極防白屏版)
  const generateWords = async () => {
    if (!topic.trim()) {
      showError("請輸入你想學習的主題！(例如：機場、咖啡廳、商用英文)");
      return;
    }

    // 點擊按鈕時順便解鎖語音引擎
    unlockAudioEngine();

    setLoading(true);
    setErrorMsg('');
    setCards([]);
    setStudyCardIndex(0);

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

    let retries = 3; // 減少重試次數，避免使用者等太久
    let delays = [1000, 2000, 4000];

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText })
        });

        // 安全讀取回應，避免非 JSON 導致崩潰
        const responseText = await response.text();
        let result;
        
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("伺服器回覆異常 (可能 Vercel 尚未部署完成或金鑰未設定)。");
        }

        if (!response.ok) {
          throw new Error(result?.error?.message || `API 請求失敗 (${response.status})`);
        }
        
        // 使用安全串連 (?.) 提取 Gemini 回傳的文字
        let jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!jsonText) {
          throw new Error("AI 回傳的內容空白或格式不符預期。");
        }
        
        // 清理 markdown 標籤
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let generatedCards;
        try {
          generatedCards = JSON.parse(jsonText);
        } catch (e) {
          throw new Error("無法將 AI 回應轉換為單字卡資料。");
        }

        if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
          throw new Error("生成的單字卡為空，請換個主題試試。");
        }
        
        // 成功！更新狀態並結束
        setCards(generatedCards);
        setLoading(false);
        return; 

      } catch (err) {
        console.error("生成錯誤詳細資訊:", err);
        if (i === retries - 1) {
          // 最後一次重試失敗才顯示錯誤
          showError("生成失敗：" + err.message);
          setLoading(false);
        } else {
          await sleep(delays[i]); 
        }
      }
    }
  };

  // 語音朗讀功能 (強化相容版)
  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      try {
        // 先強制取消與重置，解決小米等 Android 裝置卡住的問題
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; 
        utterance.rate = 0.85; // 放慢一點聽得更清楚
        
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
           // 優先尋找 Google 英文語音或系統預設英文
           const engVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en_US'));
           if (engVoice) utterance.voice = engVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        showError("語音播放失敗，請確認手機媒體音量已開啟。");
      }
    } else {
      showError("您的瀏覽器不支援語音功能。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* 頂部導航列 (已移除分頁) */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Killer Cards</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 錯誤提示氣泡 */}
      {errorMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-5 py-3 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-4 w-[90%] max-w-sm text-center text-sm font-medium leading-relaxed">
          {errorMsg}
        </div>
      )}

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col">
        <div className="space-y-6 flex-1 flex flex-col">
          
          {/* 搜尋區塊 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 w-full shrink-0">
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

          {/* 卡片展示區塊 */}
          {cards.length > 0 && (
            <div className="flex flex-col items-center justify-center flex-1 w-full pb-4">
              <div className="w-full">
                <FlashCard 
                  card={cards[studyCardIndex]} 
                  onSpeak={speakWord} 
                />
              </div>
              
              {/* 輪播控制鈕 */}
              <div className="flex items-center justify-between w-full mt-6 px-4">
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
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🃏 獨立組件：3D 翻轉單字卡 (FlashCard)
// ----------------------------------------------------------------------
function FlashCard({ card, onSpeak }) {
  const encodedPrompt = encodeURIComponent(`Minimalist clean illustration of ${card.word}, vector art, white background`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=300&nologo=true`;

  return (
    // 【修改】移除了 group-hover 觸發翻頁的效果。現在只能點擊翻頁。
    <div className="relative w-full h-[420px] max-w-sm mx-auto [perspective:1000px] cursor-pointer" onClick={(e) => {
        // 純點擊翻面：切換 [transform:rotateY(180deg)] class
        e.currentTarget.querySelector('.card-inner').classList.toggle('[transform:rotateY(180deg)]');
    }}>
      <div className="card-inner w-full h-full transition-transform duration-700 [transform-style:preserve-3d] relative">
        
        {/* --- 卡片正面 --- */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="h-[55%] w-full bg-slate-100 relative overflow-hidden shrink-0">
             <img src={imageUrl} alt={card.word} className="w-full h-full object-cover" loading="lazy" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             {/* 播放按鈕：加上 e.stopPropagation() 防止點擊時觸發卡片翻面 */}
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
              <RotateCcw className="w-4 h-4 mr-1" /> 點擊卡片翻面
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