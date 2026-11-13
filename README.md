# 🎓 Ứng Dụng Ôn Thi Trắc Nghiệm Hệ Điều Hành (K24 FIT - HCMUS)

Website ôn thi trắc nghiệm tĩnh phục vụ kỳ thi Giữa Kỳ (GK) môn Hệ Điều Hành, chuẩn hóa và tổng hợp từ các bài tập lý thuyết Moodle (`BTLT1`, `BTLT2`) và ngân hàng câu hỏi `questions.md`.

---

## ✨ Tính Năng Nổi Bật

- **2 Chế độ luyện tập linh hoạt:**
  - 📖 **Làm toàn bộ câu hỏi:** Luyện tập lần lượt tất cả câu hỏi trong cơ sở dữ liệu để quét sạch kiến thức.
  - 🎲 **Thi thử ngẫu nhiên:** Hệ thống tự động xáo trộn và rút ngẫu nhiên bộ đề **20 câu** hoặc **30 câu**.
- **Trải nghiệm thi tương tác chuẩn UX:**
  - Mỗi lượt chỉ hiển thị 1 câu hỏi, tạo sự tập trung tối đa.
  - Sau khi chọn phương án, hệ thống chờ **đúng 2 giây** với hiệu ứng kiểm tra rồi mới công bố kết quả.
  - Tô màu trực quan: **Xanh lá** cho đáp án đúng, **Đỏ** cho đáp án bạn chọn sai.
  - Tự động hiển thị giải thích (nếu đề gốc có sẵn).
  - Xuất hiện nút **"Câu tiếp theo ➔"** để bạn chủ động chuyển câu khi đã xem xong.
- **Tổng kết & Luyện lại câu sai:**
  - Màn hình kết quả chấm điểm thang 10, hiển thị số câu đúng/sai và tỉ lệ phần trăm.
  - Liệt kê toàn bộ các câu bạn đã làm sai kèm đáp án chuẩn.
  - Nút **"Luyện lại các câu làm sai"** giúp bạn làm lại ngay lập tức các câu vừa sai để khắc sâu kiến thức.
- **Tương thích 100% Mobile & Laptop:**
  - Thiết kế Responsive mượt mà, nút bấm to bản dễ thao tác trên màn hình cảm ứng điện thoại.
  - 100% Static Web (không cần backend server), mở file HTML trực tiếp là dùng được ngay.

---

## 🚀 Cách Dùng Nhanh Trên Máy Tính (Offline)

Bạn không cần cài đặt bất kỳ server nào:
1. Mở thư mục dự án.
2. Click đúp chuột vào file **`index.html`** để mở trên bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Safari).
3. Bắt đầu luyện thi ngay lập tức!

---

## 🌐 Hướng Dẫn Host Lên GitHub Pages Chi Tiết (3 Bước)

Để host trang web này lên mạng cho bản thân và bạn bè cùng ôn tập miễn phí qua link dạng `https://<tên-github>.github.io/<tên-repo>/`:

### Bước 1: Tạo Repository trên GitHub
1. Đăng nhập vào tài khoản [GitHub](https://github.com/).
2. Nhấn nút **New** (hoặc dấu `+` ở góc trên bên phải) để tạo một repository mới.
3. Đặt tên repository (ví dụ: `hdh-quiz-k24`).
4. Để chế độ **Public** và **không** cần tích chọn README hay .gitignore (vì trong máy đã có sẵn).
5. Nhấn **Create repository**.

### Bước 2: Push mã nguồn lên GitHub
Mở Terminal / PowerShell tại thư mục này và chạy các lệnh sau (thay `<username>` và `<repo-name>` bằng tài khoản và tên repo của bạn):

```bash
git remote add origin https://github.com/<username>/<repo-name>.git
git branch -M main
git push -u origin main
```

*(Nếu bạn dùng GitHub Desktop hoặc VS Code, bạn chỉ cần chọn "Publish to GitHub" là xong).*

### Bước 3: Kích hoạt GitHub Pages
1. Trên trang repository GitHub vừa tạo, vào tab **Settings** (Cài đặt) ở thanh menu trên cùng.
2. Ở thanh bên trái, cuộn xuống tìm và click vào mục **Pages** (trong nhóm *Code and automation*).
3. Tại phần **Build and deployment**:
   - Mục **Source**: Chọn **Deploy from a branch**.
   - Mục **Branch**: Chọn nhánh **`main`** và thư mục **`/(root)`**.
4. Nhấn **Save**.
5. Chờ khoảng 1 - 2 phút để GitHub hoàn tất build. F5 lại trang, bạn sẽ thấy link trang web được hiển thị ở đầu mục Pages:
   > 🔗 *Your site is live at: `https://<username>.github.io/<repo-name>/`*

Bây giờ bạn có thể mở link này trên cả điện thoại lẫn laptop để ôn thi mọi lúc mọi nơi!

---

## 🔄 Hướng Dẫn Tái Sử Dụng Script Trích Xuất Khi Có Thêm Đề Mới

Khi bạn làm thêm các bài tập lý thuyết mới trên Moodle hoặc tải thêm các file HTML bài làm khác:

1. **Lưu file HTML:** Trên trang review bài làm của Moodle, nhấn `Ctrl + S` (hoặc chuột phải chọn *Lưu trang dưới dạng...* / *Save page as...*), chọn định dạng **Webpage, HTML Only** hoặc **Webpage, Complete**.
2. **Bỏ file vào thư mục `html/`:** Kéo thả các file `.html` mới này vào thư mục `html/` của dự án.
3. **Chạy lệnh trích xuất:**
   Mở terminal tại thư mục dự án và chạy:
   ```bash
   node scripts/extract.mjs
   ```
4. **Kết quả:**
   - Script sẽ tự động quét tất cả file HTML trong thư mục `html/` cùng file `questions.md`.
   - Tự động chuẩn hóa văn bản, giải mã ký tự đặc biệt, lọc lấy đáp án đúng và loại bỏ trùng lặp.
   - Cập nhật trực tiếp vào 2 file:
     - `data/questions.json`
     - `data/questions.js`
5. **Cập nhật lên web:**
   Chỉ cần commit và push lại lên GitHub:
   ```bash
   git add html/ data/
   git commit -m "update: add new quiz questions"
   git push
   ```
   Trang web trên GitHub Pages sẽ tự động nhận ngân hàng câu hỏi mới nhất!

---

## 📁 Cấu Trúc Thư Mục

```text
├── html/                     # Chứa các file HTML bài làm Moodle (BTLT1, BTLT2,...)
├── data/
│   ├── questions.json        # Dữ liệu câu hỏi chuẩn dạng JSON
│   └── questions.js          # Dữ liệu nhúng window.QUIZ_DATA (tránh lỗi CORS)
├── scripts/
│   └── extract.mjs           # Script tự động trích xuất & khử trùng lặp
├── tests/
│   ├── test_extractor.mjs    # Test kiểm tra trích xuất dữ liệu
│   └── test_app.mjs          # Test kiểm tra tính toàn vẹn ứng dụng web
├── index.html                # Giao diện chính ứng dụng ôn tập
├── style.css                 # Phong cách giao diện hiện đại & responsive mobile
├── app.js                    # Logic chạy đề, tính giờ 2s, chấm điểm, thống kê
├── questions.md              # File đề thi PDF đã trích xuất dạng markdown
└── README.md                 # Hướng dẫn chi tiết sử dụng & deploy
```
