import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYGQglJDG_-q_g6rIz5gB_3oxN4wdV8I0",
  authDomain: "todofuken-milkyway.firebaseapp.com",
  databaseURL: "https://todofuken-milkyway-default-rtdb.firebaseio.com",
  projectId: "todofuken-milkyway",
  storageBucket: "todofuken-milkyway.firebasestorage.app",
  messagingSenderId: "311729338163",
  appId: "1:311729338163:web:f2aba5f28a17fb4b6b7046",
  measurementId: "G-55T5RQ5EZT"
};

const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

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
        regionKo: "도호쿠", regionJa: "東北", nameKo: "이와테현", nameJa: "岩手県",
        specialties: [{ko:"냉면",ja:"冷麺"}, {ko:"마에사와 소고기",ja:"前沢牛"}],
        spots: [{ko:"주손지",ja:"中尊寺"}, {ko:"고이와이 농장",ja:"小岩井農場"}]
    },
    {
        regionKo: "도호쿠", regionJa: "東北", nameKo: "미야기현", nameJa: "宮城県",
        specialties: [{ko:"우설",ja:"牛タン"}, {ko:"즌다모치",ja:"ずんだ餅"}],
        spots: [{ko:"마쓰시마",ja:"松島"}, {ko:"센다이 성터",ja:"仙台城跡"}]
    },
    {
        regionKo: "도호쿠", regionJa: "東北", nameKo: "아키타현", nameJa: "秋田県",
        specialties: [{ko:"키리탄포",ja:"きりたんぽ"}, {ko:"이나니와 우동",ja:"稲庭うどん"}],
        spots: [{ko:"다자와호",ja:"田沢湖"}, {ko:"가쿠노다테",ja:"角館"}]
    },
    {
        regionKo: "도호쿠", regionJa: "東北", nameKo: "야마가타현", nameJa: "山形県",
        specialties: [{ko:"체리",ja:"さくらんぼ"}, {ko:"요네자와 소고기",ja:"米沢牛"}],
        spots: [{ko:"긴잔 온천",ja:"銀山温泉"}, {ko:"야마데라",ja:"山寺"}]
    },
    {
        regionKo: "도호쿠", regionJa: "東北", nameKo: "후쿠시마현", nameJa: "福島県",
        specialties: [{ko:"복숭아",ja:"桃"}, {ko:"기타카타 라멘",ja:"喜多方ラーメン"}],
        spots: [{ko:"오우치주쿠",ja:"大内宿"}, {ko:"쓰루가성",ja:"鶴ヶ城"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "이바라키현", nameJa: "茨城県",
        specialties: [{ko:"낫토",ja:"納豆"}, {ko:"멜론",ja:"メロン"}],
        spots: [{ko:"가이라쿠엔",ja:"偕楽園"}, {ko:"히타치 해변 공원",ja:"ひたち海浜公園"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "도치기현", nameJa: "栃木県",
        specialties: [{ko:"교자",ja:"餃子"}, {ko:"딸기",ja:"いちご"}],
        spots: [{ko:"닛코 동조궁",ja:"日光東照宮"}, {ko:"게곤 폭포",ja:"華厳の滝"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "군마현", nameJa: "群馬県",
        specialties: [{ko:"곤약",ja:"こんにゃく"}, {ko:"야키만주",ja:"焼きまんじゅう"}],
        spots: [{ko:"구사쓰 온천",ja:"草津温泉"}, {ko:"도미오카 제사장",ja:"富岡製糸場"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "사이타마현", nameJa: "埼玉県",
        specialties: [{ko:"소카 센베이",ja:"草加せんべい"}, {ko:"사야마 차",ja:"狭山茶"}],
        spots: [{ko:"가와고에",ja:"川越"}, {ko:"사이타마 슈퍼 아레나",ja:"さいたまスーパーアリーナ"}]
    },
    {
        regionKo: "관동", regionJa: "関東", nameKo: "지바현", nameJa: "千葉県",
        specialties: [{ko:"땅콩",ja:"落花生"}, {ko:"간장",ja:"醤油"}],
        spots: [{ko:"도쿄 디즈니 리조트",ja:"東京ディズニーリゾート"}, {ko:"나리타산 신쇼지",ja:"成田山新勝寺"}]
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
        regionKo: "주부", regionJa: "中部", nameKo: "니이가타현", nameJa: "新潟県",
        specialties: [{ko:"고시히카리 쌀",ja:"コシヒカリ"}, {ko:"사사당고",ja:"笹だんご"}],
        spots: [{ko:"사도 광산",ja:"佐渡金山"}, {ko:"에치고유자와",ja:"越後湯沢"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "도야마현", nameJa: "富山県",
        specialties: [{ko:"송어 초밥",ja:"ます寿司"}, {ko:"흰새우",ja:"白えび"}],
        spots: [{ko:"다테야마 구로베 알펜루트",ja:"立山黒部アルペンルート"}, {ko:"구로베 댐",ja:"黒部ダム"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "이시카와현", nameJa: "石川県",
        specialties: [{ko:"금박",ja:"金箔"}, {ko:"노도구로",ja:"のどぐろ"}],
        spots: [{ko:"겐로쿠엔",ja:"兼六園"}, {ko:"히가시 차야가이",ja:"ひがし茶屋街"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "후쿠이현", nameJa: "福井県",
        specialties: [{ko:"에치젠 게",ja:"越前がに"}, {ko:"오로시 소바",ja:"おろしそば"}],
        spots: [{ko:"도진보",ja:"東尋坊"}, {ko:"에이헤이지",ja:"永平寺"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "야마나시현", nameJa: "山梨県",
        specialties: [{ko:"호토",ja:"ほうとう"}, {ko:"포도",ja:"ぶどう"}],
        spots: [{ko:"가와구치호",ja:"河口湖"}, {ko:"후지큐 하이랜드",ja:"富士急ハイランド"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "나가노현", nameJa: "長野県",
        specialties: [{ko:"신슈 소바",ja:"信州そば"}, {ko:"오야키",ja:"おやき"}],
        spots: [{ko:"젠코지",ja:"善光寺"}, {ko:"마쓰모토성",ja:"松本城"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "기후현", nameJa: "岐阜県",
        specialties: [{ko:"히다 소고기",ja:"飛騨牛"}, {ko:"은어",ja:"鮎"}],
        spots: [{ko:"시라카와고",ja:"白川郷"}, {ko:"게로 온천",ja:"下呂温泉"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "시즈오카현", nameJa: "静岡県",
        specialties: [{ko:"녹차",ja:"お茶"}, {ko:"장어",ja:"うなぎ"}],
        spots: [{ko:"후지산",ja:"富士山"}, {ko:"하마나호",ja:"浜名湖"}]
    },
    {
        regionKo: "주부", regionJa: "中部", nameKo: "아이치현", nameJa: "愛知県",
        specialties: [{ko:"히츠마부시",ja:"ひつまぶし"}, {ko:"미소카츠",ja:"味噌カツ"}],
        spots: [{ko:"나고야성",ja:"名古屋城"}, {ko:"도요타 박물관",ja:"トヨタ博物館"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "미에현", nameJa: "三重県",
        specialties: [{ko:"마쓰사카 소고기",ja:"松阪牛"}, {ko:"이세 우동",ja:"伊勢うどん"}],
        spots: [{ko:"이세 신궁",ja:"伊勢神宮"}, {ko:"나가시마 스파랜드",ja:"ナガシマスパーランド"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "시가현", nameJa: "滋賀県",
        specialties: [{ko:"오미 소고기",ja:"近江牛"}, {ko:"붕어 초밥",ja:"鮒ずし"}],
        spots: [{ko:"비와호",ja:"琵琶湖"}, {ko:"히코네성",ja:"彦根城"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "교토부", nameJa: "京都府",
        specialties: [{ko:"말차",ja:"抹茶"}, {ko:"야츠하시",ja:"八ツ橋"}],
        spots: [{ko:"금각사",ja:"金閣寺"}, {ko:"기요미즈데라",ja:"清水寺"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "오사카부", nameJa: "大阪府",
        specialties: [{ko:"타코야키",ja:"たこ焼き"}, {ko:"오코노미야키",ja:"お好み焼き"}],
        spots: [{ko:"도톤보리",ja:"道頓堀"}, {ko:"오사카성",ja:"大阪城"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "효고현", nameJa: "兵庫県",
        specialties: [{ko:"고베 소고기",ja:"神戸牛"}, {ko:"아카시야키",ja:"明石焼き"}],
        spots: [{ko:"히메지성",ja:"姫路城"}, {ko:"아리마 온천",ja:"有馬温泉"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "나라현", nameJa: "奈良県",
        specialties: [{ko:"카키노하즈시",ja:"柿の葉寿司"}, {ko:"나라즈케",ja:"奈良漬"}],
        spots: [{ko:"도다이지",ja:"東大寺"}, {ko:"나라 공원",ja:"奈良公園"}]
    },
    {
        regionKo: "간사이", regionJa: "関西", nameKo: "와카야마현", nameJa: "和歌山県",
        specialties: [{ko:"감귤",ja:"みかん"}, {ko:"매실",ja:"梅"}],
        spots: [{ko:"고야산",ja:"高野山"}, {ko:"시라하라 해변",ja:"白良浜"}]
    },
    {
        regionKo: "주고쿠", regionJa: "中国", nameKo: "돗토리현", nameJa: "鳥取県",
        specialties: [{ko:"배",ja:"梨"}, {ko:"대게",ja:"ズワイガニ"}],
        spots: [{ko:"돗토리 사구",ja:"鳥取砂丘"}, {ko:"미즈키 시게루 로드",ja:"水木しげるロード"}]
    },
    {
        regionKo: "주고쿠", regionJa: "中国", nameKo: "시마네현", nameJa: "島根県",
        specialties: [{ko:"이즈모 소바",ja:"出雲そば"}, {ko:"재첩",ja:"しじみ"}],
        spots: [{ko:"이즈모 타이샤",ja:"出雲大社"}, {ko:"마쓰에성",ja:"松江城"}]
    },
    {
        regionKo: "주고쿠", regionJa: "中国", nameKo: "오카야마현", nameJa: "岡山県",
        specialties: [{ko:"키비당고",ja:"きびだんご"}, {ko:"백도",ja:"白桃"}],
        spots: [{ko:"구라시키 미관지구",ja:"倉敷美観地区"}, {ko:"오카야마 후라쿠엔",ja:"岡山後楽園"}]
    },
    {
        regionKo: "주고쿠", regionJa: "中国", nameKo: "히로시마현", nameJa: "広島県",
        specialties: [{ko:"굴",ja:"牡蠣"}, {ko:"모미지만주",ja:"もみじ饅頭"}],
        spots: [{ko:"이츠쿠시마 신사",ja:"厳島神社"}, {ko:"원폭 돔",ja:"原爆ドーム"}]
    },
    {
        regionKo: "주고쿠", regionJa: "中国", nameKo: "야마구치현", nameJa: "山口県",
        specialties: [{ko:"복어",ja:"ふぐ"}, {ko:"가와라 소바",ja:"瓦そば"}],
        spots: [{ko:"긴타이쿄",ja:"錦帯橋"}, {ko:"아키요시다이",ja:"秋吉台"}]
    },
    {
        regionKo: "시코쿠", regionJa: "四国", nameKo: "도쿠시마현", nameJa: "徳島県",
        specialties: [{ko:"스다치",ja:"すだち"}, {ko:"도쿠시마 라멘",ja:"徳島ラーメン"}],
        spots: [{ko:"나루토 소용돌이",ja:"鳴門の渦潮"}, {ko:"아와오도리 회관",ja:"阿波おどり会館"}]
    },
    {
        regionKo: "시코쿠", regionJa: "四国", nameKo: "가가와현", nameJa: "香川県",
        specialties: [{ko:"사누키 우동",ja:"讃岐うどん"}, {ko:"올리브",ja:"オリーブ"}],
        spots: [{ko:"리츠린 공원",ja:"栗林公園"}, {ko:"쇼도시마",ja:"小豆島"}]
    },
    {
        regionKo: "시코쿠", regionJa: "四国", nameKo: "에히메현", nameJa: "愛媛県",
        specialties: [{ko:"귤",ja:"みかん"}, {ko:"도미 덮밥",ja:"鯛めし"}],
        spots: [{ko:"도고 온천",ja:"道後温泉"}, {ko:"마쓰야마성",ja:"松山城"}]
    },
    {
        regionKo: "시코쿠", regionJa: "四国", nameKo: "고치현", nameJa: "高知県",
        specialties: [{ko:"가쓰오 타타키",ja:"かつおのタタキ"}, {ko:"유자",ja:"ゆず"}],
        spots: [{ko:"고치성",ja:"高知城"}, {ko:"시만토강",ja:"四万十川"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "후쿠오카현", nameJa: "福岡県",
        specialties: [{ko:"돈코츠 라멘",ja:"豚骨ラーメン"}, {ko:"명란젓",ja:"明太子"}],
        spots: [{ko:"다자이후 텐만구",ja:"太宰府天満宮"}, {ko:"나카스 포장마차",ja:"中洲屋台"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "사가현", nameJa: "佐賀県",
        specialties: [{ko:"사가 소고기",ja:"佐賀牛"}, {ko:"오징어회",ja:"イカの活き造り"}],
        spots: [{ko:"요시노가리 유적",ja:"吉野ヶ里遺跡"}, {ko:"우레시노 온천",ja:"嬉野温泉"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "나가사키현", nameJa: "長崎県",
        specialties: [{ko:"카스테라",ja:"カステラ"}, {ko:"짬뽕",ja:"ちゃんぽん"}],
        spots: [{ko:"하우스텐보스",ja:"ハウステンボス"}, {ko:"글로버 정원",ja:"グラバー園"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "구마모토현", nameJa: "熊本県",
        specialties: [{ko:"말고기 회",ja:"馬刺し"}, {ko:"카라시렌콘",ja:"辛子蓮根"}],
        spots: [{ko:"구마모토성",ja:"熊本城"}, {ko:"아소산",ja:"阿蘇山"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "오이타현", nameJa: "大分県",
        specialties: [{ko:"가보스",ja:"かぼす"}, {ko:"토리텐",ja:"とり天"}],
        spots: [{ko:"벳푸 지옥온천",ja:"別府地獄めぐり"}, {ko:"유후인",ja:"湯布院"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "미야자키현", nameJa: "宮崎県",
        specialties: [{ko:"치킨 난반",ja:"チキン南蛮"}, {ko:"망고",ja:"マンゴー"}],
        spots: [{ko:"다카치호 협곡",ja:"高千穂峡"}, {ko:"아오시마",ja:"青島"}]
    },
    {
        regionKo: "규슈", regionJa: "九州", nameKo: "가고시마현", nameJa: "鹿児島県",
        specialties: [{ko:"흑돼지",ja:"黒豚"}, {ko:"고구마 소주",ja:"芋焼酎"}],
        spots: [{ko:"사쿠라지마",ja:"桜島"}, {ko:"야쿠시마",ja:"屋久島"}]
    },
    {
        regionKo: "오키나와", regionJa: "沖縄", nameKo: "오키나와현", nameJa: "沖縄県",
        specialties: [{ko:"고야 참푸루",ja:"ゴーヤーチャンプルー"}, {ko:"친스코",ja:"ちんすこう"}, {ko:"우미부도",ja:"海ぶどう"}],
        spots: [{ko:"츄라우미 수족관",ja:"美ら海水族館"}, {ko:"슈리성",ja:"首里城"}, {ko:"만자모",ja:"万座毛"}]
    }
];

let currentUser = null;
let currentMode = ''; 
let currentQuizLang = 'ko'; // 선택한 퀴즈 언어 모드 저장용
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
            msg.style.color = "#4ade80"; 
            msg.innerText = "가입 성공! 로그인 중...";
        } else {
            await signInWithEmailAndPassword(auth, email, pw);
            msg.innerText = "";
        }
    } catch (error) {
        msg.style.color = "#ff6b6b"; 
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

window.app = {
    logout: () => signOut(auth),
    
    showPolicy: (type) => {
        if (type === 'tos') showScreen('tos-screen');
        if (type === 'privacy') showScreen('privacy-screen');
    },

    resetMyRecords: async () => {
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
        currentMode = ''; 
        showScreen('main-screen');
    },

    startFlashcard: () => {
        currentMode = 'flashcard';
        flashcardIndex = 0;
        app.updateFlashcard();
        showScreen('flashcard-screen');
    },
    
    updateFlashcard: () => {
        const lang = document.getElementById('lang-flashcard').value;
        const p = prefectures[flashcardIndex];
        const front = document.getElementById('fc-front');
        const back = document.getElementById('fc-back');
        
        document.getElementById('flashcard').classList.remove('flipped');
        
        // 도(지방) 부분을 더 확실하게 표기하기 위해 디자인 적용
        const regionKoStr = `<span style="font-size:0.55em; color:#a5b4fc; display:block; margin-bottom:5px; font-weight:normal;">${p.regionKo} 지방</span>`;
        const regionJaStr = `<span style="font-size:0.55em; color:#a5b4fc; display:block; margin-bottom:5px; font-weight:normal;">${p.regionJa} 地方</span>`;

        if (lang === 'ko') {
            front.innerHTML = `${regionKoStr} ${p.nameKo}`;
            back.innerHTML = `${regionJaStr} ${p.nameJa}`;
        } else {
            front.innerHTML = `${regionJaStr} ${p.nameJa}`;
            back.innerHTML = `${regionKoStr} ${p.nameKo}`;
        }
    },
    
    flipCard: () => document.getElementById('flashcard').classList.toggle('flipped'),
    nextCard: () => { flashcardIndex = (flashcardIndex + 1) % prefectures.length; app.updateFlashcard(); },
    prevCard: () => { flashcardIndex = (flashcardIndex - 1 + prefectures.length) % prefectures.length; app.updateFlashcard(); },

    startQuiz: (type) => {
        currentMode = 'quiz-' + type;
        currentQuizLang = document.getElementById('lang-quiz-' + type).value;
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

    // 힌트 보기 버튼 클릭 시 실행
    showHint: () => {
        document.getElementById('show-hint-btn').classList.add('hidden');
        document.getElementById('quiz-hint').classList.remove('hidden');
    },

    nextQuestion: () => {
        document.getElementById('quiz-feedback').innerText = '';
        document.getElementById('short-answer-input').value = '';
        currentQuizPrefecture = getRandom(prefectures);
        
        // 문제 전환 시 힌트 다시 숨기기
        document.getElementById('show-hint-btn').classList.remove('hidden');
        document.getElementById('quiz-hint').classList.add('hidden');
        document.getElementById('quiz-hint').innerText = '';

        const qType = Math.floor(Math.random() * 3);
        let clue = "";
        
        // 언어 모드에 맞춰 문제/단서 생성
        if (currentQuizLang === 'ko') {
            document.getElementById('quiz-question').innerText = "어떤 도도부현일까요? (단서가 필요하면 힌트 보기를 누르세요!)";
            if (qType === 0) clue = `특산물: ${getRandom(currentQuizPrefecture.specialties).ko}`;
            else if (qType === 1) clue = `유명한 곳: ${getRandom(currentQuizPrefecture.spots).ko}`;
            else clue = `어느 지방? ${currentQuizPrefecture.regionKo} 지방`;
        } else {
            document.getElementById('quiz-question').innerText = "どの都道府県でしょうか？ (ヒントが必要な場合はボタンをクリック！)";
            if (qType === 0) clue = `特産物: ${getRandom(currentQuizPrefecture.specialties).ja}`;
            else if (qType === 1) clue = `有名な場所: ${getRandom(currentQuizPrefecture.spots).ja}`;
            else clue = `どの地方？ ${currentQuizPrefecture.regionJa} 地方`;
        }

        // 힌트 박스에 내용 저장
        document.getElementById('quiz-hint').innerText = clue;

        // 정답 설정 (언어 모드에 따라 다름)
        const answerName = currentQuizLang === 'ko' ? currentQuizPrefecture.nameJa : currentQuizPrefecture.nameKo;

        if (currentMode === 'quiz-multiple') {
            let options = [currentQuizPrefecture];
            while(options.length < 4) {
                let randP = getRandom(prefectures);
                if (!options.includes(randP)) options.push(randP);
            }
            options.sort(() => Math.random() - 0.5);
            
            const btns = document.querySelectorAll('.choice-btn');
            btns.forEach((btn, i) => {
                const optionName = currentQuizLang === 'ko' ? options[i].nameJa : options[i].nameKo;
                btn.innerText = optionName;
                btn.onclick = () => app.checkAnswer(optionName === answerName);
            });
        } else {
            document.getElementById('short-answer-input').placeholder = currentQuizLang === 'ko' ? "정답 입력 (ex: 北海道)" : "정답 입력 (ex: 홋카이도)";
        }
    },

    checkAnswer: (isCorrect) => {
        const feedback = document.getElementById('quiz-feedback');
        const answerName = currentQuizLang === 'ko' ? currentQuizPrefecture.nameJa : currentQuizPrefecture.nameKo;

        if (isCorrect) {
            score += 10;
            document.getElementById('current-score').innerText = score;
            feedback.style.color = "#4ade80";
            feedback.innerText = "정답입니다! 🎉";
            setTimeout(app.nextQuestion, 1000);
        } else {
            feedback.style.color = "#f87171";
            feedback.innerText = `틀렸습니다! 정답은 ${answerName} 입니다.`;
            setTimeout(app.nextQuestion, 2000);
        }
    },

    checkShortAnswer: () => {
        const userInput = document.getElementById('short-answer-input').value.trim();
        const answerName = currentQuizLang === 'ko' ? currentQuizPrefecture.nameJa : currentQuizPrefecture.nameKo;
        app.checkAnswer(userInput === answerName);
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
