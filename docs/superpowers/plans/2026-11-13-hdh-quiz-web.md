# Ứng Dụng Ôn Thi Trắc Nghiệm Hệ Điều Hành - Kế Hoạch Triển Khai (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng bộ công cụ trích xuất câu hỏi từ file HTML Moodle và markdown, cùng ứng dụng web tĩnh phục vụ ôn thi trắc nghiệm môn Hệ Điều Hành (K24 HCMUS), hỗ trợ 2 chế độ (làm hết hoặc random 20/30 câu), tương thích di động & máy tính, sẵn sàng host lên GitHub Pages.

**Architecture:** 
- CLI extraction pipeline (`scripts/extract.mjs`) phân tích cú pháp HTML Moodle và `questions.md`, chuẩn hóa và khử trùng lặp dữ liệu, ghi ra `data/questions.json` và `data/questions.js`.
- Frontend SPA tĩnh (`index.html`, `style.css`, `app.js`) sử dụng Vanilla JavaScript để tương thích 100% khi mở trực tiếp file cục bộ lẫn triển khai qua GitHub Pages mà không gặp lỗi CORS.
- Tài liệu hướng dẫn `README.md` cung cấp chi tiết cách tái sử dụng script khi có file HTML mới và cách cấu hình GitHub Pages.

**Tech Stack:** Node.js (v24 ES Modules), HTML5, Modern CSS3 (Flexbox/Grid, Responsive Media Queries), Vanilla JavaScript.

**Spec:** `docs/superpowers/specs/2026-11-13-hdh-quiz-web-design.md`

## Global Constraints
- Phải trích xuất đủ 20 câu hỏi từ mỗi file HTML và các câu trắc nghiệm trong `questions.md`.
- Khử trùng lặp thông minh; nếu có xung đột, Moodle HTML là chân lý.
- Giữ nguyên giải thích nếu có trong nguồn; không tự bịa đặt giải thích mới.
- 2 chế độ làm bài: Làm tất cả câu hỏi hoặc ngẫu nhiên 20/30 câu.
- Hiển thị từng câu một; chọn xong chờ 2 giây mới hiển thị đáp án đúng/sai và nút chuyển câu tiếp theo.
- Hoạt động mượt mà không lỗi CORS khi mở offline trực tiếp hoặc host trên GitHub Pages.

## Review Focus
1. Parser HTML Moodle phải trích xuất chính xác các câu hỏi có thẻ HTML lồng nhau, công thức toán học hoặc ký tự đặc biệt (`<`, `>`, `&`).
2. Deduplication không được làm mất các câu hỏi khác nhau nhưng có mở đầu giống nhau.
3. Khi người dùng click chọn phương án, phải vô hiệu hóa ngay việc click đổi lựa chọn khác trong thời gian đếm 2 giây.
4. Màn hình responsive trên cả màn hình nhỏ (chiều rộng 360px của mobile) không bị tràn ngang hay vỡ chữ.
5. Khi người dùng làm bài ở chế độ Random 20 câu, thuật toán shuffle phải đảm bảo không bị trùng lặp câu hỏi trong cùng một lượt làm.

---

### Task 1: Xây dựng Script trích xuất dữ liệu (`scripts/extract.mjs`) & Kiểm thử

**Files:**
- Create: `scripts/extract.mjs`
- Create: `tests/test_extractor.mjs`
- Test: `data/questions.json` & `data/questions.js`

- [ ] **Step 1: Viết test case kiểm thử bộ trích xuất dữ liệu (`tests/test_extractor.mjs`)**
  - Viết test kiểm tra:
    - Quét được tất cả file `.html` trong `html/`.
    - Trích xuất đúng số câu hỏi (mỗi file HTML đủ 20 câu).
    - Parse được các câu hỏi từ `questions.md`.
    - Sinh ra file `data/questions.json` và `data/questions.js`.
    - Dữ liệu có cấu trúc đúng schema: `id`, `source`, `question`, `options`, `correctIndex`, `correctAnswer`, `explanation`.
    - Khử trùng lặp chính xác (số câu unique > 70).
  - Expected: Chạy `node tests/test_extractor.mjs` thất bại do `scripts/extract.mjs` chưa được tạo hoặc chưa chạy.

- [ ] **Step 2: Chạy test và xác nhận thất bại (RED)**
  - Command: `node tests/test_extractor.mjs`
  - Expected: Báo lỗi file không tồn tại hoặc dữ liệu chưa được sinh.

- [ ] **Step 3: Cài đặt script trích xuất `scripts/extract.mjs`**
  - Đọc file HTML bằng Node.js FS:
    - Tìm các khối `<div id="question-... " class="que multichoice ...">`.
    - Lấy text câu hỏi trong `<div class="qtext">`.
    - Lấy danh sách options trong `<div class="answer">`.
    - Lấy đáp án đúng trong `<div class="rightanswer">` hoặc radio checked + class `.correct`.
    - Lấy giải thích nếu có trong `<div class="feedback">` (loại bỏ text "The correct answer is:").
  - Đọc `questions.md`:
    - Regex tìm `\*\*Câu \d+.*?\*\*:\s*([^\n]+)`.
    - Lấy các lựa chọn `A.`, `B.`, `C.`, `D.`.
    - Lấy đáp án đúng từ lựa chọn được bôi đậm `\*\*[A-D]\.\s*(.*?)\*\*`.
  - Khử trùng lặp theo text câu hỏi (chuẩn hóa chữ hoa/thường và khoảng trắng).
  - Xuất ra `data/questions.json` và `data/questions.js` (với nội dung `window.QUIZ_DATA = [...]`).

- [ ] **Step 4: Chạy script và chạy test kiểm tra (GREEN)**
  - Command: `node scripts/extract.mjs && node tests/test_extractor.mjs`
  - Expected: Script thông báo trích xuất thành công, test PASS 100%.

- [ ] **Step 5: Commit mã nguồn Task 1**
  - Command: `git add scripts/ tests/ data/ && git commit -m "feat: automated question extraction script and question dataset"`

---

### Task 2: Xây dựng Giao diện Ứng dụng Ôn tập Trắc nghiệm (`index.html`, `style.css`, `app.js`)

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `app.js`

- [ ] **Step 1: Xây dựng khung HTML cấu trúc SPA (`index.html`)**
  - Màn hình 1: Welcome Screen (`#welcome-screen`) với tiêu đề, tổng số câu hỏi, 2 lựa chọn (Làm tất cả / Random 20 hoặc 30 câu).
  - Màn hình 2: Quiz Screen (`#quiz-screen`) với thanh tiến độ, thẻ câu hỏi, 4 phương án, thông báo kết quả (xanh/đỏ), nút "Câu tiếp theo".
  - Màn hình 3: Result Screen (`#result-screen`) với vòng tròn điểm, thống kê đúng/sai, danh sách xem lại câu sai, nút làm lại đề mới / luyện lại câu sai.
  - Nhúng `data/questions.js` trước `app.js` để dữ liệu luôn sẵn sàng mà không cần request fetch.

- [ ] **Step 2: Xây dựng giao diện Responsive chuẩn UX Mobile & Laptop (`style.css`)**
  - Bảng màu hiện đại (Indigo/Slate), bo tròn mềm mại, shadow nhẹ.
  - Mobile touch targets: Chiều cao tối thiểu 48px cho các phương án, font chữ 16px để không bị zoom trên iOS Safari.
  - Trạng thái options: normal, selected, waiting (pulse animation), correct (green), wrong (red), disabled.
  - Tối ưu Media queries cho màn hình mobile (< 640px) và laptop.

- [ ] **Step 3: Cài đặt logic trạng thái và tương tác (`app.js`)**
  - Quản lý state: `allQuestions`, `activeQuestions`, `currentIndex`, `score`, `wrongQuestions`, `isAnswering`.
  - Chế độ "Làm tất cả": lấy toàn bộ `allQuestions`.
  - Chế độ "Random": Fisher-Yates shuffle và slice 20 câu (hoặc 30 câu theo lựa chọn).
  - Hàm `selectOption(index)`:
    - Khóa tương tác (`isAnswering = true`).
    - Thêm class `selected` và hiện trạng thái "Đang kiểm tra...".
    - `setTimeout` 2000ms:
      - Kiểm tra `index === currentQuestion.correctIndex`.
      - Highlight xanh cho đáp án đúng, đỏ cho đáp án người dùng chọn sai.
      - Hiện thông báo kết quả và giải thích (nếu có).
      - Hiện nút "Câu tiếp theo ➔".
  - Chuyển câu / Kết thúc bài làm: Hiển thị màn hình kết quả, danh sách câu làm sai và xử lý nút "Luyện lại câu sai".

- [ ] **Step 4: Kiểm thử ứng dụng trên trình duyệt (Browser Verification)**
  - Chạy web tĩnh cục bộ và kiểm tra:
    - Bấm "Làm tất cả" -> chuyển sang màn hình quiz câu 1.
    - Chọn 1 đáp án -> chờ đúng 2s -> hiện kết quả đúng/sai.
    - Bấm "Câu tiếp theo" -> sang câu 2.
    - Hoàn thành bài làm -> hiện màn hình kết quả chuẩn xác.
    - Chạy ở chế độ "Random 20 câu" -> làm đúng 20 câu ngẫu nhiên.

- [ ] **Step 5: Commit mã nguồn Task 2**
  - Command: `git add index.html style.css app.js && git commit -m "feat: responsive quiz web application with 2s delay and 2 quiz modes"`

---

### Task 3: Hướng dẫn Triển khai GitHub Pages & Tài liệu Tái sử dụng (`README.md`)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Soạn thảo file `README.md` chi tiết**
  - Giới thiệu ứng dụng ôn thi trắc nghiệm Hệ Điều Hành K24 HCMUS.
  - Hướng dẫn mở offline trực tiếp trên máy tính.
  - Hướng dẫn từng bước kích hoạt GitHub Pages miễn phí từ repository GitHub.
  - Hướng dẫn cách cập nhật thêm đề thi khi có thêm file HTML mới từ Moodle (`node scripts/extract.mjs`).
  - Cấu trúc thư mục dự án.

- [ ] **Step 2: Kiểm tra tổng thể toàn bộ hệ thống**
  - Chạy lại script trích xuất để kiểm tra tính toàn vẹn của dữ liệu.
  - Kiểm tra các link, hình ảnh và hiển thị trên cả trình duyệt máy tính và giả lập di động.

- [ ] **Step 3: Commit hoàn thành Task 3**
  - Command: `git add README.md && git commit -m "docs: comprehensive README with GitHub Pages deployment and extraction guide"`

