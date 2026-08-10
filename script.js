// Firestore에서 삭제 기능(deleteDoc, doc, where)을 추가로 임포트합니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ 본인의 파이어베이스 설정으로 교체하세요
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

// 도도부현 데이터 (샘플 10개 - 기존과 동일)
const prefectures = [
    {
        regionKo: "홋카이도", regionJa: "北海道", nameKo: "홋카이도", nameJa: "北海道",
        specialties: [{ko:"털게",ja:"毛ガニ"}, {ko:"유바리 멜론",ja:"夕張メロン"}, {ko:"성게",ja:"ウニ"}],
        spots: [{ko:"삿포로 시계탑",ja:"札幌時計台"}, {ko:"오타루 운하",ja:"小樽運河"}]
    },
    {
        regionKo: "도호쿠", regionJa: "東北", nameKo: "아오모리현", nameJa: "青森県",
        specialties: [{ko:"사과",ja:"りんご"}, {ko:"마늘",ja:"にんにく"}],
        spots: [{ko:"네부타 축제",ja:"ねぶた祭"}, {ko:"오이라세계류",ja:"奥入瀬渓流"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "도쿄도", nameJa: "東京都",
        specialties: [{ko:"도쿄 바나나",ja:"東京ばな奈"}, {ko:"몬자야키",ja:"もんじゃ焼き"}],
        spots: [{ko:"도쿄 타워",ja:"東京タワー"}, {ko:"센소지",ja:"浅草寺"}, {ko:"스카이트리",ja:"スカイツリー"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "가나가와현", nameJa: "神奈川県",
        specialties: [{ko:"슈마이",ja:"シウマイ"}, {ko:"가마보코",ja:"かまぼこ"}],
        spots: [{ko:"요코하마 중화가",ja:"横浜中華街"}, {ko:"하코네 온천",ja:"箱根温泉"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "시즈오카현", nameJa: "静岡県",
        specialties: [{ko:"녹차",ja:"お茶"}, {ko:"장어",ja:"うなぎ"}],
        spots: [{ko:"후지산",ja:"富士山"}, {ko:"하마나호",ja:"浜名湖"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "오사카부", nameJa: "大阪府",
        specialties: [{ko:"타코야키",ja:"たこ焼き"}, {ko:"오코노미야키",ja:"お好み焼き"}],
        spots: [{ko:"도톤보리",ja:"道頓堀"}, {ko:"오사카성",ja:"大阪城"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "교토부", nameJa: "京都府",
        specialties: [{ko:"말차",ja:"抹茶"}, {ko:"야츠하시",ja:"八ツ橋"}],
        spots: [{ko:"금각사",ja:"金閣寺"}, {ko:"기요미즈데라",ja:"清水寺"}]
    },
    {
        regionKo: "주고쿠", regionJa: "中国", nameKo: "히로시마현", nameJa: "広島県",
        specialties: [{ko:"굴",ja:"牡蠣"}, {ko:"모미지만주",ja:"もみじ饅頭"}],
        spots: [{ko:"이츠쿠시마 신사",ja:"厳島神社"}, {ko:"원폭 돔",ja:"原爆ドーム"}]
    },
    {
        regionKo: "시코쿠", regionJa: "四国", nameKo: "가가와현", nameJa: "香川県",
        specialties: [{ko:"사누키 우동",ja:"讃岐うどん"}, {ko:"올리브",ja:"オリーブ"}],
        spots: [{ko:"리츠린 공원",ja:"栗林公園"}, {ko:"쇼도시마",ja:"小豆島"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "후쿠오카현", nameJa: "福岡県",
        specialties: [{ko:"돈코츠 라멘",ja:"豚骨ラーメン"}, {ko:"명란젓",ja:"明太子"}],
        spots: [{ko:"다자이후 텐만구",ja:"太宰府天満宮"}, {ko:"나카스 포장마차",ja:"中洲屋台"}]
    }
];

let currentUser = null;
let currentMode = ''; 
let currentQuizPrefecture = null;
let score = 0;
let flashcardIndex = 0;
const ADMIN_ID = "admin";

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

document.getElementById('login-btn').addEventListener('click', () => handleAuth('login'));
document.getElementById('signup-btn').addEventListener('click', () => handleAuth('signup'));

async function handleAuth(action) {
    const id = document.getElementById('username').value.trim();
    const pw = document.getElementById('password').value;
    const msg = document.getElementById('auth-message');
    
    if(!id || !pw) return msg.innerText = "아이디와 비밀번호를 입력하세요.";
    
    const email = `${id}@japanquiz.com`; 

    try {
        if (action === 'signup') {
            await createUserWithEmailAndPassword(auth, email, pw);
            msg.style.color = "#4ade80"; // 초록색
            msg.innerText = "가입 성공! 로그인 중...";
        } else {
            await signInWithEmailAndPassword(auth, email, pw);
            msg.innerText = "";
        }
    } catch (error) {
        msg.style.color = "#ff6b6b"; // 빨간색
        msg.innerText = "오류: " + error.message;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        const displayId = user.email.split('@')[0];
        document.getElementById('welcome-msg').innerText = `${displayId}님, 환영합니다!`;
        showScreen('main-screen');
        
        if (displayId === ADMIN_ID) {
            document.getElementById('admin-btn').classList.remove('hidden');
        } else {
            document.getElementById('admin-btn').classList.add('hidden');
        }
    } else {
        currentUser = null;
        showScreen('auth-screen');
    }
});

// 앱 전역 객체
window.app = {
    logout: () => signOut(auth),
    
    // ★ 새로 추가된 유저 기록 초기화 함수
    resetMyRecords: async () => {
        if (!currentUser) return;
        const displayId = currentUser.email.split('@')[0];
        
        const isConfirm = confirm("정말로 모든 기록을 삭제하시겠습니까?\n(이 작업은 되돌릴 수 없습니다!)");
        if (!isConfirm) return;

        try {
            // 현재 로그인된 아이디(userId)와 일치하는 기록만 검색
            const q = query(collection(db, "records"), where("userId", "==", displayId));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                alert("삭제할 기록이 없습니다.");
                return;
            }

            // 검색된 문서들을 순회하며 일괄 삭제 진행
            const deletePromises = [];
            snapshot.forEach(document => {
                deletePromises.push(deleteDoc(doc(db, "records", document.id)));
            });
            
            await Promise.all(deletePromises); // 모든 삭제가 완료될 때까지 대기
            alert("기록이 성공적으로 초기화되었습니다.");
            
        } catch (error) {
            console.error("기록 삭제 오류:", error);
            alert("기록 삭제 중 오류가 발생했습니다.");
        }
    },

    goHome: async () => {
        if(currentMode.includes('quiz') && score > 0) {
            const displayId = currentUser.email.split('@')[0];
            await addDoc(collection(db, "records"), {
                userId: displayId,
                score: score,
                mode: currentMode,
                date: new Date().toISOString()
            });
            alert(`기록이 저장되었습니다! 최종 점수: ${score}`);
        }
        showScreen('main-screen');
    },

    startFlashcard: () => {
        currentMode = 'flashcard';
        flashcardIndex = 0;
        app.updateFlashcard();
        showScreen('flashcard-screen');
    },
    updateFlashcard: () => {
        const lang = document.getElementById('lang-select').value;
        const p = prefectures[flashcardIndex];
        const front = document.getElementById('fc-front');
        const back = document.getElementById('fc-back');
        
        document.getElementById('flashcard').classList.remove('flipped');
        
        if (lang === 'ko') {
            front.innerHTML = `${p.regionKo}<br>${p.nameKo}`;
            back.innerHTML = `${p.regionJa}<br>${p.nameJa}`;
        } else {
            front.innerHTML = `${p.regionJa}<br>${p.nameJa}`;
            back.innerHTML = `${p.regionKo}<br>${p.nameKo}`;
        }
    },
    flipCard: () => document.getElementById('flashcard').classList.toggle('flipped'),
    nextCard: () => { flashcardIndex = (flashcardIndex + 1) % prefectures.length; app.updateFlashcard(); },
    prevCard: () => { flashcardIndex = (flashcardIndex - 1 + prefectures.length) % prefectures.length; app.updateFlashcard(); },

    startQuiz: (type) => {
        currentMode = 'quiz-' + type;
        score = 0;
        document.getElementById('current-score').innerText = score;
        document.getElementById('quiz-feedback').innerText = '';
        showScreen('quiz-screen');
        
        if (type === 'multiple') {
            document.getElementById('multiple-choice-box').classList.remove('hidden');
            document.getElementById('short-answer-box').classList.add('hidden');
        } else {
            document.getElementById('multiple-choice-box').classList.add('hidden');
            document.getElementById('short-answer-box').classList.remove('hidden');
        }
        app.nextQuestion();
    },

    nextQuestion: () => {
        document.getElementById('quiz-feedback').innerText = '';
        document.getElementById('short-answer-input').value = '';
        currentQuizPrefecture = getRandom(prefectures);
        
        const qType = Math.floor(Math.random() * 3);
        let clue = "";
        
        if (qType === 0) clue = `특산물: ${getRandom(currentQuizPrefecture.specialties).ko}`;
        else if (qType === 1) clue = `유명한 곳: ${getRandom(currentQuizPrefecture.spots).ko}`;
        else clue = `어느 지방? ${currentQuizPrefecture.regionKo}지방`;

        document.getElementById('quiz-question').innerText = `다음 설명에 해당하는 도도부현은 어디일까요?\n\n힌트: ${clue}`;

        if (currentMode === 'quiz-multiple') {
            let options = [currentQuizPrefecture];
            while(options.length < 4) {
                let randP = getRandom(prefectures);
                if (!options.includes(randP)) options.push(randP);
            }
            options.sort(() => Math.random() - 0.5);
            
            const btns = document.querySelectorAll('.choice-btn');
            btns.forEach((btn, i) => {
                btn.innerText = options[i].nameJa;
                btn.onclick = () => app.checkAnswer(options[i].nameJa === currentQuizPrefecture.nameJa);
            });
        }
    },

    checkAnswer: (isCorrect) => {
        const feedback = document.getElementById('quiz-feedback');
        if (isCorrect) {
            score += 10;
            document.getElementById('current-score').innerText = score;
            feedback.style.color = "#4ade80";
            feedback.innerText = "정답입니다! 🎉";
            setTimeout(app.nextQuestion, 1000);
        } else {
            feedback.style.color = "#f87171";
            feedback.innerText = `틀렸습니다! 정답은 ${currentQuizPrefecture.nameJa} 입니다.`;
            setTimeout(app.nextQuestion, 2000);
        }
    },

    checkShortAnswer: () => {
        const userInput = document.getElementById('short-answer-input').value.trim();
        app.checkAnswer(userInput === currentQuizPrefecture.nameJa);
    },

    showAdmin: async () => {
        showScreen('admin-screen');
        const list = document.getElementById('user-records');
        list.innerHTML = '로딩 중...';
        
        const q = query(collection(db, "records"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const dateStr = new Date(data.date).toLocaleString();
            const li = document.createElement('li');
            li.innerText = `[${dateStr}] ${data.userId}님 - ${data.mode} 모드 : ${data.score}점`;
            list.appendChild(li);
        });
    }
};
// ... 기존 파이어베이스 세팅 및 도도부현 데이터, 인증 로직 등은 그대로 유지 ...

// 앱 전역 객체
window.app = {
    logout: () => signOut(auth),
    
    // ★ 새롭게 추가된 정책 화면 호출 기능
    showPolicy: (type) => {
        if (type === 'tos') showScreen('tos-screen');
        if (type === 'privacy') showScreen('privacy-screen');
    },

    resetMyRecords: async () => {
        // 기존 코드와 동일
        if (!currentUser) return;
        const displayId = currentUser.email.split('@')[0];
        
        const isConfirm = confirm("정말로 모든 기록을 삭제하시겠습니까?\n(이 작업은 되돌릴 수 없습니다!)");
        if (!isConfirm) return;

        try {
            const q = query(collection(db, "records"), where("userId", "==", displayId));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                alert("삭제할 기록이 없습니다.");
                return;
            }

            const deletePromises = [];
            snapshot.forEach(document => {
                deletePromises.push(deleteDoc(doc(db, "records", document.id)));
            });
            
            await Promise.all(deletePromises);
            alert("기록이 성공적으로 초기화되었습니다.");
            
        } catch (error) {
            console.error("기록 삭제 오류:", error);
            alert("기록 삭제 중 오류가 발생했습니다.");
        }
    },

    goHome: async () => {
        // 기존 코드와 동일
        if(currentMode.includes('quiz') && score > 0) {
            const displayId = currentUser.email.split('@')[0];
            await addDoc(collection(db, "records"), {
                userId: displayId,
                score: score,
                mode: currentMode,
                date: new Date().toISOString()
            });
            alert(`기록이 저장되었습니다! 최종 점수: ${score}`);
        }
        currentMode = ''; // 정책 화면에서 돌아올 때를 대비해 초기화
        showScreen('main-screen');
    },

    // ... 아래 startFlashcard, updateFlashcard, startQuiz 등 나머지 함수들은 기존 코드와 100% 동일하게 유지하시면 됩니다 ...
