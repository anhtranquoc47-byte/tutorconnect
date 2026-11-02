USE TutorConnectDb;
GO
SET NOCOUNT ON;
GO

DECLARE @TargetUserId INT;
DECLARE @TargetRole NVARCHAR(20);

-- 1. Lấy thông tin tài khoản 't@gmail.com'
SELECT TOP 1 
    @TargetUserId = Id, 
    @TargetRole = [Role] 
FROM dbo.Users 
WHERE Email = 't@gmail.com';

IF @TargetUserId IS NULL
BEGIN
    PRINT N'Không tìm thấy tài khoản t@gmail.com trong bảng Users!';
    RETURN;
END;

PRINT N'Đã tìm thấy User Id: ' + CAST(@TargetUserId AS NVARCHAR(10)) + N' | Role: ' + @TargetRole;

/* =========================================================================
   BƯỚC 1: LẤY CÁC TUTO SUBJECTS ĐÃ CÓ SẴN TRONG DATABASE
   ========================================================================= */
DECLARE @TutorSub1 INT, @TutorSub2 INT;

SELECT @TutorSub1 = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.TutorSubjects WHERE IsActive = 1) t WHERE RowNum = 1;
SELECT @TutorSub2 = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.TutorSubjects WHERE IsActive = 1) t WHERE RowNum = 2;

-- Dự phòng nếu chỉ có 1 TutorSubject
SET @TutorSub2 = ISNULL(@TutorSub2, @TutorSub1);

/* =========================================================
   BƯỚC 2: CHÈN LỊCH BOOKINGS VÀO CÁC NGÀY THỨ 5
   ========================================================= */
IF @TargetRole = 'Student'
BEGIN
    INSERT INTO dbo.Bookings (StudentId, TutorSubjectId, StartTimeUtc, EndTimeUtc, CreditCost, Status, StudentNote, MeetingUrl)
    VALUES 
        -- Thứ 5 ngày 13/08/2026 (Đã xong)
        (@TargetUserId, @TutorSub1, '2026-08-13 09:00:00', '2026-08-13 10:00:00', 120, 'Completed', N'Học Thứ 5 tuần trước.', N'https://meet.google.com/thu5-01'),
        -- Thứ 5 ngày 20/08/2026 (Hôm qua - Đã xong)
        (@TargetUserId, @TutorSub2, '2026-08-20 15:00:00', '2026-08-20 16:00:00', 150, 'Completed', N'Học Thứ 5 vừa rồi.', N'https://meet.google.com/thu5-02'),
        -- Thứ 5 ngày 27/08/2026 (Sắp tới)
        (@TargetUserId, @TutorSub1, '2026-08-27 09:00:00', '2026-08-27 10:00:00', 120, 'Confirmed', N'Lịch hẹn Thứ 5 tuần sau.', N'https://meet.google.com/thu5-03');

    PRINT N'==> CHÈN THÀNH CÔNG DỮ LIỆU BOOKINGS THỨ 5!';
END
GO

/* =========================================================
   BƯỚC 3: XEM LẠI TOÀN BỘ BOOKINGS CỦA t@gmail.com
   ========================================================= */
SELECT 
    b.Id AS BookingId,
    DATENAME(WEEKDAY, b.StartTimeUtc) AS [DayOfWeek], 
    s.FullName AS StudentName,
    s.Email AS StudentEmail,
    t_user.FullName AS TutorName,
    sub.Name AS SubjectName,
    b.StartTimeUtc,
    b.Status
FROM dbo.Bookings b
JOIN dbo.Users s ON s.Id = b.StudentId
JOIN dbo.TutorSubjects ts ON ts.Id = b.TutorSubjectId
JOIN dbo.Users t_user ON t_user.Id = ts.TutorId
JOIN dbo.Subjects sub ON sub.Id = ts.SubjectId
WHERE s.Email = 't@gmail.com'
ORDER BY b.StartTimeUtc DESC;
GO