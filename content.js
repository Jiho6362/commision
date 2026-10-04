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
    name: "작가 이름",
    image: "",  // 프로필 이미지 링크. 비워두면 이름 첫 글자가 표시됩니다.
    intro: `간단한 자기소개를 적어주세요.
주로 작업하는 리깅 스타일, 사용 툴, 커미션 진행 방식 등을 짧게 소개합니다.`,
    tags: ["#Live2D", "#버튜버 리깅", "#VTube Studio"],
  },

  /* ===================== 2. Portfolio =====================
     작업물 추가: { ... }, 블록 하나를 통째로 복사해서 붙여 넣고 내용만 바꾸기
     - youtube: 유튜브 주소를 그대로 붙여 넣으면 됩니다.
     - category: 같은 이름끼리 묶여서 위쪽 버튼이 자동으로 만들어집니다.
     - 맨 위에 있는 작업물이 화면 맨 앞에 나옵니다.
  */
  works: [
    {
      youtube: "https://www.youtube.com/watch?v=b_2SKc25JU0",
      title: "작업물 제목",
      category: "풀바디",
      credit: `일러스트: OOO님
리깅: 작가 이름
2026.09`,
    },
    {
      youtube: "https://www.youtube.com/watch?v=b_2SKc25JU0",
      title: "작업물 제목",
      category: "하프바디",
      credit: `일러스트: OOO님
리깅: 작가 이름
2026.08`,
    },
    {
      youtube: "https://www.youtube.com/watch?v=b_2SKc25JU0",
      title: "작업물 제목",
      category: "기타",
      credit: `일러스트: OOO님
리깅: 작가 이름
2026.07`,
    },
  ],

  /* ===================== 3. Price =====================
     options: 가격표의 열 (옵션 이름, 가격, 설명)
     rows:    가격표의 행. values 는 options 순서대로 적기
  */
  price: {
    options: [
      { name: "베이직",   price: "300,000원", description: `방송에 필요한 기본 움직임 위주의 리깅입니다.` },
      { name: "스탠다드", price: "500,000원", description: `기본 리깅에 세밀한 머리카락 물리와 추가 표정이 포함됩니다.` },
      { name: "프리미엄", price: "800,000원", description: `전체 옵션이 포함된 리깅입니다. 상세 내용은 문의 주세요.` },
    ],
    rows: [
      { label: "기본 표정 수",  values: ["4개", "6개", "8개"] },
      { label: "머리카락 물리", values: ["기본", "세밀", "세밀"] },
      { label: "수정 횟수",     values: ["1회", "2회", "3회"] },
      { label: "작업 기간",     values: ["2주", "3주", "4주"] },
    ],
    notices: [
      "리깅용 파츠 분리가 완료된 PSD 파일이 필요합니다.",
      "입금 확인 후 작업이 시작됩니다.",
    ],
  },

  /* ===================== 4. Contact =====================
     link 예시: 이메일은 "mailto:주소", 그 외는 https:// 로 시작하는 주소
  */
  contacts: [
    { label: "EMAIL",       text: "example@email.com", link: "mailto:example@email.com" },
    { label: "X (TWITTER)", text: "@example",          link: "https://x.com/example" },
    { label: "OPEN KAKAO",  text: "링크로 이동",        link: "https://open.kakao.com/" },
  ],

};
