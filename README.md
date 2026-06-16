# ClubHub React + Tailwind

Phiên bản React/TypeScript được dựng lại từ 14 screen Stitch, sử dụng theme FPT-inspired:

- Cam `#F26F21`: hành động chính, navigation active, focus
- Xanh dương `#0072BC`: thông tin và dữ liệu phụ
- Xanh lá `#22A447`: thành công, approved, active
- Chỉ có ba global role: `STUDENT`, `CLUB_ADMIN`, `SYSTEM_ADMIN`

## Chạy dự án

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

## Route

| Route | Screen |
|---|---|
| `/` | Trang chủ |
| `/style-guide` | Style guide |
| `/login` | Đăng nhập nâng cao |
| `/login/compact` | Đăng nhập gọn |
| `/register` | Đăng ký |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password` | Đặt lại mật khẩu |
| `/dashboard` | Dashboard sinh viên |
| `/profile` | Hồ sơ cá nhân |
| `/profile/edit` | Chỉnh sửa hồ sơ |
| `/account/security` | Bảo mật tài khoản |
| `/notifications` | Trung tâm thông báo |
| `/club-admin` | Dashboard quản trị CLB |
| `/system-admin` | Dashboard quản trị hệ thống |

Các màn hình dùng mock data và đã sẵn sàng để nối service/API sau này.
