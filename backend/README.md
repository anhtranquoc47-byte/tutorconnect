# TutorConnect Backend (.NET 10)

Backend base theo Clean Architecture dành cho **Đề tài 05 – Nền tảng Kết nối Gia sư – Học viên với Lịch học Động & Theo dõi Tiến độ**.

**Tên tiếng Anh:** Adaptive Tutor–Student Matching & Progress Tracking Platform.

Project hiện là base sạch, chưa chứa entity hoặc nghiệp vụ cụ thể. Nhóm có thể phát triển các module Authentication, Student, Tutor, Subject, Matching, Availability, Booking, Session, Progress, Review và Admin trên cấu trúc này.

## Thành phần được giữ lại

- 4 tầng: Domain, Application, Infrastructure.SqlServer và API.
- Dependency Injection theo từng tầng.
- MediatR cho CQRS và Mapster cho mapping.
- Entity Framework Core + SQL Server.
- Swagger.
- Global exception handler.
- Response envelope dùng chung.
- BaseEntity, phân trang và endpoint `GET /api/health`.
- GitHub Actions build workflow.

## Chạy project

Yêu cầu: .NET SDK 10 và SQL Server/LocalDB.

```powershell
dotnet restore .\TutorConnect.slnx
dotnet build .\TutorConnect.slnx
dotnet run --project .\TutorConnect.API\TutorConnect.API.csproj
```

Hoặc mở `TutorConnect.slnx` bằng Microsoft Visual Studio, đặt `TutorConnect.API` làm Startup Project rồi nhấn `F5`.

Swagger:

```text
https://localhost:7191/swagger
```

Kiểm tra API:

```text
GET https://localhost:7191/api/health
```

## Cấu trúc solution

```text
TutorConnect.Domain
TutorConnect.Application
TutorConnect.Infrastructure.SqlServer
TutorConnect.API
```

## Phát triển module mới

1. Tạo entity và domain rule tại `TutorConnect.Domain`.
2. Tạo command/query, DTO, interface và handler tại `TutorConnect.Application`.
3. Tạo EF configuration, migration và repository tại `TutorConnect.Infrastructure.SqlServer`.
4. Đăng ký dependency trong `DependencyInjection.cs` của tầng tương ứng.
5. Tạo request, response và controller tại `TutorConnect.API`.

Xem `docs/ADD_NEW_FEATURE.md` để biết vị trí file mẫu cho một feature mới.
