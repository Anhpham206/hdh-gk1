# Thiết Kế Hệ Thống Ứng Dụng Ôn Thi Trắc Nghiệm Hệ Điều Hành (GitHub Pages)

- **Ngày:** 2026-11-13
- **Tác giả:** Antigravity (Google DeepMind) & User (K24 HCMUS)
- **Mục tiêu:** Xây dựng website ôn tập trắc nghiệm tĩnh phục vụ kỳ thi Giữa Kỳ môn Hệ Điều Hành, trích xuất dữ liệu từ các bài làm Moodle (BTLT1, BTLT2) và ngân hàng câu hỏi `questions.md`, host trực tiếp trên GitHub Pages và tối ưu tương thích hoàn hảo trên cả laptop lẫn điện thoại di động. Cung cấp script trích xuất tự động để tái sử dụng khi người dùng thêm file HTML mới, và file README hướng dẫn chi tiết cách host trên GitHub Pages.

---

## 1. Intent and Why (Ý định & Lý do)

Sinh viên K24 HCMUS cần ôn tập các câu hỏi trắc nghiệm từ các bài tập lý thuyết trên Moodle (`BTLT1`, `BTLT2`) và bộ đề thi trắc nghiệm trong `questions.md`. Người dùng dự kiến sẽ còn thêm nhiều file HTML bài làm Moodle khác trong tương lai, do đó cần:
- Một công cụ web ôn thi tương tác: Làm từng câu một, chờ 2 giây hiển thị kết quả đúng/sai trực quan, 2 chế độ làm hết hoặc random 20/30 câu.
- Một script trích xuất độc lập, dễ dùng (`node scripts/extract.mjs`): Chỉ cần bỏ thêm file HTML mới vào thư mục `html/`, chạy script là cơ sở dữ liệu câu hỏi tự động cập nhật, tự khử trùng lặp mà không cần chỉnh sửa code thủ công.
- Hướng dẫn chi tiết từng bước (`README.md`) để đưa trang web lên GitHub Pages miễn phí.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals (Mục tiêu)
1. **Script trích xuất tự động & có thể tái sử dụng (`scripts/extract.mjs`):**
   - Tự động quét toàn bộ file `.html` trong thư mục `html/`.
   - Trích xuất toàn bộ câu hỏi trắc nghiệm từ các file HTML Moodle và từ file `questions.md`.
   - Tự động chuẩn hóa văn bản, phát hiện và khử trùng lặp (deduplication) thông minh.
   - Ưu tiên dữ liệu chuẩn xác từ file HTML Moodle khi có xung đột.
   - Chỉ giữ giải thích nếu có sẵn trong đề gốc; không tự tạo giải thích.
   - Xuất dữ liệu đồng thời ra 2 file: `data/questions.json` và `data/questions.js` (gán `window.QUIZ_DATA = [...]`).
2. **Giao diện Web Ôn tập (UX/UI):**
   - Thiết kế Responsive mượt mà trên Mobile & Desktop/Laptop.
   - 2 chế độ: Làm tất cả câu hỏi hoặc Random 20/30 câu ngẫu nhiên.
   - Cơ chế 1 câu/màn hình, chờ 2 giây sau khi bấm chọn, highlight xanh/đỏ, nút "Câu tiếp theo".
   - Màn hình kết quả: điểm số, thống kê đúng/sai, danh sách xem lại câu sai kèm nút luyện lại câu sai.
3. **Hướng dẫn Host GitHub Pages (`README.md`):**
   - Hướng dẫn chi tiết từng bước: Tạo Git repo, push code lên GitHub, bật GitHub Pages trong Settings (Deploy from branch `main` / root).
   - Hướng dẫn cách cập nhật thêm câu hỏi mới khi có thêm file HTML.

### Non-Goals (Không nằm trong mục tiêu)
- Không tạo backend server hay tài khoản người dùng.
- Không tự sinh giải thích AI nếu nguồn không có.

### Anti-Goals (Chống mục tiêu)
- Không viết logic trích xuất cứng (hardcode) chỉ cho 4 file hiện tại; script phải linh hoạt nhận bất kỳ file HTML Moodle nào được bỏ vào `html/`.
- Không dùng framework build cồng kềnh (Webpack, Vite, React) gây khó khăn cho việc mở offline hoặc deploy GitHub Pages.

---

## 3. Data Structure (Cấu trúc dữ liệu)

```json
[
  {
    "id": "q-1",
    "source": "BTLT1_24120231.html",
    "question": "Tiến trình P1 bị rơi vào trạng thái Zombie khi nào?",
    "options": [
      "P1 kết thúc nhưng tiến trình cha của P1 chưa nhận được tín hiệu kết thúc",
      "Tiến trình cha của P1 kết thúc trước P1",
      "P1 bị thu hồi tài nguyên nhưng vẫn nằm trong hệ thống",
      "P1 không được cấp CPU trong một thời gian dài"
    ],
    "correctIndex": 0,
    "correctAnswer": "P1 kết thúc nhưng tiến trình cha của P1 chưa nhận được tín hiệu kết thúc",
    "explanation": null
  }
]
```

---

## 4. Implementation Components
1. `scripts/extract.mjs`: Script Node.js tự động đọc `html/*.html` và `questions.md`, trích xuất câu hỏi, khử trùng lặp, ghi ra `data/questions.json` và `data/questions.js`.
2. `index.html`: Khung ứng dụng ôn tập đơn trang.
3. `style.css`: Giao diện hiện đại, tối ưu chạm cảm ứng trên di động và phím tắt trên máy tính.
4. `app.js`: Logic chạy đề, tính giờ 2s, chấm điểm, thống kê.
5. `README.md`: Hướng dẫn sử dụng script trích xuất và cách host lên GitHub Pages chi tiết.
