import React, { useState } from 'react';

// ----------------------------------------------------------------------
// 🎨 內建圖示區
// ----------------------------------------------------------------------
const Volume2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const BookOpen = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const Loader2 = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const Search = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const RotateCcw = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const ChevronLeft = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>;

// ----------------------------------------------------------------------
// 🚀 App 主程式
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
    setTimeout(() => setErrorMsg(''), 6000); // 稍微延長錯誤顯示時間方便閱讀
  };

  // 呼叫 API 生成單字卡 (徹底防白屏崩潰版)
  const generateWords = async () => {
    if (!topic.trim()) {
      showError("請輸入你想學習的主題！(例如：機場、咖啡廳)");
      return;
    }

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
      - "pinyin": 拼音或音標
      - "translation": 繁體中文翻譯
      - "example": 一句包含該單字的實用外語例句及中文翻譯
      - "memoryTrick": 一個好記的諧音記憶法、或是字根字首拆解
      不要包含任何 Markdown 標記，只要純 JSON 字串。
    `;

    let retries = 3; 
    let delays = [1000, 2000, 4000];

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText })
        });

        const responseText = await response.text();
        let result;
        
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("伺服器回覆異常 (請確定 Vercel 部署成功)。");
        }

        // 🚨 修復重點：Vercel 會把 Google API 的錯誤包在 HTTP 200 裡面。
        // 所以即使 response.ok 是 true，我們也要檢查 result 裡面有沒有 error 欄位！
        if (!response.ok || (result && result.error)) {
          const errMsg = (result && result.error && result.error.message) 
            ? result.error.message 
            : `API 請求失敗 (${response.status})`;
          throw new Error(`Google API 拒絕請求: ${errMsg}`);
        }
        
        // 安全提取資料
        let jsonText = "";
        if (result && result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            jsonText = result.candidates[0].content.parts[0].text;
        } else if (Array.isArray(result)) {
            // 防呆：如果後端已經幫忙解析好，直接轉換
            jsonText = JSON.stringify(result);
        } else {
            console.error("未知的回傳格式:", result);
            throw new Error("AI 回傳的內容空白或格式不符預期，請重試。");
        }
        
        // 清理標籤
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let generatedCards;
        try {
          generatedCards = JSON.parse(jsonText);
        } catch (e) {
          throw new Error("無法解析單字資料，這通常是因為 AI 沒照格式回傳，請再試一次。");
        }

        if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
          throw new Error("生成的單字卡為空，請換個主題試試。");
        }
        
        // 成功！
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

  // 🔊 終極語音朗讀功能 (Google Translate Audio 繞過手機限制)
  const speakWord = (text) => {
    if (!text) return;

    try {
      // 方案 A: 使用 HTML5 Audio 直接播放 Google 翻譯的語音 (100% 支援所有手機瀏覽器)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      
      audio.play().catch(e => {
        console.warn("Audio API 被阻擋，啟動備用方案", e);
        fallbackTTS(text); // 若因某些原因被擋，退回方案 B
      });
    } catch (err) {
      fallbackTTS(text);
    }
  };

  // 備用語音方案 (原生 SpeechSynthesis)
  const fallbackTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // 先清空卡住的音軌
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      showError("您的手機瀏覽器完全不支援發音功能。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
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

      {errorMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-5 py-3 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-4 w-[90%] max-w-sm text-center text-sm font-medium leading-relaxed">
          {errorMsg}
        </div>
      )}

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col">
        <div className="space-y-6 flex-1 flex flex-col">
          
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

          {/* 安全防護：確保 cards 陣列有資料且目前的 index 存在，才渲染卡片，防止白屏死機 */}
          {cards && cards.length > 0 && cards[studyCardIndex] && (
            <div className="flex flex-col items-center justify-center flex-1 w-full pb-4">
              <div className="w-full">
                <FlashCard 
                  card={cards[studyCardIndex]} 
                  onSpeak={speakWord} 
                />
              </div>
              
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
// 🃏 獨立組件：3D 翻轉單字卡
// ----------------------------------------------------------------------
function FlashCard({ card, onSpeak }) {
  // 極致防白屏：如果元件被渲染但 card 是 undefined，直接回傳 null 不渲染
  if (!card || !card.word) return null;

  const encodedPrompt = encodeURIComponent(`Minimalist clean illustration of ${card.word}, vector art, white background`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=300&nologo=true`;

  return (
    <div className="relative w-full h-[420px] max-w-sm mx-auto [perspective:1000px] cursor-pointer" onClick={(e) => {
        // 純點擊翻面：切換 class
        e.currentTarget.querySelector('.card-inner').classList.toggle('[transform:rotateY(180deg)]');
    }}>
      <div className="card-inner w-full h-full transition-transform duration-700 [transform-style:preserve-3d] relative">
        
        {/* --- 卡片正面 --- */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="h-[55%] w-full bg-slate-100 relative overflow-hidden shrink-0">
             <img src={imageUrl} alt={card.word} className="w-full h-full object-cover" loading="lazy" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             {/* 發音按鈕 */}
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
            <p className="text-slate-500 font-medium mt-2 text-lg">{card.pinyin || ''}</p>
            <div className="mt-4 flex items-center text-sm text-indigo-500 font-medium opacity-70">
              <RotateCcw className="w-4 h-4 mr-1" /> 點擊卡片翻面
            </div>
          </div>
        </div>

        {/* --- 卡片背面 --- */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-800 text-slate-50 rounded-2xl shadow-xl p-6 flex flex-col overflow-y-auto border-t-4 border-indigo-500">
           <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-4 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white">{card.translation || ''}</h3>
                <p className="text-slate-400 text-sm mt-1">{card.word} • {card.pinyin || ''}</p>
              </div>
           </div>
           <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">📝 實用例句</div>
                <p className="text-slate-200 text-[15px] leading-relaxed">{card.example || ''}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">💡 記憶法 / 拆解</div>
                <p className="text-slate-300 text-[15px] leading-relaxed">{card.memoryTrick || ''}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}