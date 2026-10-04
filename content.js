/*
  ✏️ 페이지 내용은 이 파일에서만 고치면 됩니다.

  주의할 점
  - 글자는 "큰따옴표" 안에 적습니다.
  - 여러 줄 글(소개, 크레딧, 설명)은 `백틱` 안에 적습니다. 엔터로 줄을 바꾸면 화면에서도 줄이 바뀝니다.
  - 항목과 항목 사이에는 쉼표(,)가 있어야 합니다.
  - 저장했는데 화면에 오류 문구가 뜨면 쉼표나 따옴표가 빠지지 않았는지 확인해 주세요.
*/
window.CONTENT = {

  /* ===================== 1. About Me ===================== */
  about: {
    role: "RIGGER",  // 이름 위에 작게 표시되는 문구
    name: "4ki",
    subname: "사키",         // 이름 옆에 작게 표시되는 읽는 법/다른 이름. 필요 없으면 "" 로 비우기
    image: "images/profile_small.png",  // 프로필 이미지 (images 폴더의 파일 또는 https:// 링크). 비워두면 이름 첫 글자가 표시됩니다.
    intro: `안녕하세요, 리깅 작가로 활동 중인 4ki(사키)입니다.
자연스럽고 말랑한 리깅을 목표로 작업하고 있습니다 🙂`,
    tags: ["#Live2D", "#버튜버 리깅", "#VTube Studio"],
  },

  /* ===================== 2. Portfolio =====================
     작업물 추가: { ... }, 블록 하나를 통째로 복사해서 붙여 넣고 내용만 바꾸기
     - youtube: 유튜브 주소를 그대로 붙여 넣으면 됩니다. 비워두면("") '비어있음' 칸으로 표시됩니다.
     - category: 같은 이름끼리 묶여서 위쪽 버튼이 자동으로 만들어집니다.
     - 맨 위에 있는 작업물이 화면 맨 앞에 나옵니다.
  */
  works: [
    {
      youtube: "https://www.youtube.com/watch?v=q47rMI-Slkw",
      title: "초췌한 소하",
      category: "Light",
      credit: `Illustrated by 하리
Rigged by 4ki`,
    },
    {
      youtube: "https://www.youtube.com/watch?v=zzmy8eCx-O4",
      title: "훼시",
      category: "Standard",
      credit: `Illustrated by 나에
Rigged by 4ki`,
    },
    {
      youtube: "https://www.youtube.com/watch?v=i-4U8_7t0Hw",
      title: "작련",
      category: "Premium",
      credit: `Illustrated by 수선화
Rigged by 4ki`,
    },
    {
      youtube: "https://www.youtube.com/watch?v=-iiCBIo3N9I",
      title: "하토",
      category: "Premium",
      credit: `Illustrated by 259万
Rigged by 4ki`,
    },
    {
      youtube: "https://youtu.be/HLJmKaRxb4E",
      title: "모두의 아치",
      category: "Premium",
      credit: `Illustrated by 259万
Rigged by 4ki`,
    },
    {
      youtube: "https://www.youtube.com/watch?v=Ztj3rAcGkDg",
      title: "kiri님 월페이퍼",
      category: "Wallpaper",
      credit: `Illustrated by Haruri
Rigged by 4ki`,
    },
    {
      youtube: "https://youtu.be/Nw-7MIbBYAo",
      title: "류님 신의상 월페이퍼",
      category: "Wallpaper",
      credit: `Illustrated by 광태
Rigged by 4ki`,
    },
  ],

  /* ===================== Collaboration =====================
     함께 작업한 아티스트. 블록을 복사해서 추가
     - image: 프로필 이미지 (images 폴더의 파일 또는 https:// 링크). 비워두면 이름 첫 글자가 표시됩니다.
     - role:  이름 아래 작은 태그
  */
  collabs: [
    { name: "하리",    role: "일러스트", image: "" },
    { name: "나에",    role: "일러스트", image: "" },
    { name: "수선화",  role: "일러스트", image: "" },
    { name: "259万",   role: "일러스트", image: "" },
    { name: "Haruri",  role: "일러스트", image: "" },
    { name: "광태",    role: "일러스트", image: "" },
  ],

  /* ===================== 3. Price =====================
     options: 가격표의 열 (옵션 이름, 가격, 설명)
     rows:    가격표의 행. values 는 options 순서대로 적기 (포함 ○ / 미포함 ✕ / 해당 없음 -)
  */
  price: {
    options: [
      {
        name: "Light",
        price: "600,000원",
        description: `처음 시작하는 분들을 위한 부담 없는 입문용 옵션입니다.
기본적인 움직임과 자연스러운 물리가 구현되어 있습니다.`,
      },
      {
        name: "Standard",
        price: "800,000원",
        description: `안정적인 기본 구성으로 완성도 높은 퀄리티를 구현하는 표준 옵션입니다.
더욱 자연스러운 움직임과 풍부한 물리가 구현되어 있습니다.`,
      },
      {
        name: "Premium",
        price: "1,000,000원",
        description: `정교한 리깅과 디테일한 작업을 더해 자신만의 독창적인 캐릭터를 완성하는 옵션입니다.
표정에 따른 이목구비 변화와 입 오물오물, 아·에·이·오·우, 입 앙 다물기 등 세밀한 입 모양 표현이 가능합니다.`,
      },
      {
        name: "Wallpaper",
        price: "200,000원",
        description: `Live2D를 이용해서 방송 대기화면, 또는 배포용으로 루프 애니메이션을 제작합니다.`,
      },
    ],
    rows: [
      { label: "기본 움직임",   values: ["○", "○", "○", "○"] },
      { label: "기본 표정 토글", values: ["2개", "3개", "5개", "-"] },
      { label: "볼 부풀리기 · 입 삐죽이기", values: ["✕", "○", "○", "-"] },
      { label: "VBridger",      values: ["✕", "✕", "○", "-"] },
    ],
    /* 추가 옵션: 블록을 복사해서 추가. 가격은 기본가 */
    addons: [
      { name: "표정 파츠",      price: "20,000원" },
      { name: "애니메이션 표정", price: "50,000원" },
      { name: "눈썹 / 입 토글",  price: "50,000원" },
      { name: "동물 귀 · 꼬리",  price: "50,000원" },
      { name: "의상 ON/OFF",    price: "150,000원" },
      { name: "팔 포즈",        price: "70,000원+" },
      { name: "추가 장식",      price: "50,000원+" },
      { name: "신헤어",         price: "150,000원+" },
      { name: "신의상",         price: "250,000원+" },
      { name: "다가오기",       price: "200,000원+" },
    ],
    addonNote: "표시된 금액은 기본가이며, 작업 내용에 따라 달라질 수 있습니다.",
    notices: [
      "리깅용 파츠 분리가 완료된 PSD 파일이 필요합니다.",
      "입금 확인 후 작업이 시작됩니다.",
    ],
  },

  /* ===================== 4. Apply (신청 양식) =====================
     의뢰인이 항목을 고르고 적은 뒤 '양식 복사하기'로 복사해서 아트머그 신청서에 붙여 넣습니다.
     fields: 양식 항목
       - options: [...] 가 있으면 선택 버튼 (하나만 선택, 다시 누르면 취소)
       - options 가 없으면 입력칸. input: "textarea" 로 적으면 여러 줄 입력칸
       - placeholder: 입력칸에 회색으로 보이는 예시 글
  */
  apply: {
    guide: `아래 양식을 작성한 뒤 복사해서 아트머그 신청서에 붙여 넣어 주세요.`,
    fields: [
      { label: "닉네임",          placeholder: "닉네임을 적어 주세요" },
      { label: "신청 옵션",       options: ["Light", "Standard", "Premium", "Wallpaper"] },
      { label: "모델 용도",       options: ["방송용", "개인 소장", "상업적 이용"] },
      { label: "PSD 파츠 분리",   options: ["완료", "미완료"] },
      { label: "희망 마감일",     placeholder: "예) 2026.12.31 / 협의 가능" },
      { label: "참고 자료 및 요청 사항", input: "textarea", placeholder: "참고 링크나 요청 사항을 자유롭게 적어 주세요" },
    ],
  },

};
