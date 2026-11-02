USE TutorConnectDb;
GO

SET NOCOUNT ON;
GO

DECLARE @TargetUserId INT;
DECLARE @TargetRole NVARCHAR(20);

-- 1. Tìm UserId và Role của tài khoản 't@gmail.com'
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


/* =========================================================
   TRƯỜNG HỢP 1: t@gmail.com LÀ TUTOR 
   -> Ghép lịch với NHIỀU HỌC SINH KHÁC NHAU
   ========================================================= */
IF @TargetRole = 'Tutor'
BEGIN
    -- Tạo TutorProfile & Subject nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM dbo.TutorProfiles WHERE UserId = @TargetUserId)
        INSERT INTO dbo.TutorProfiles (UserId, Bio, Qualification, ExperienceYears, VerificationDocumentUrl, ApprovalStatus, SubmittedAtUtc)
        VALUES (@TargetUserId, N'Gia sư Tiếng Anh kinh nghiệm', N'Cử nhân', 4, N'https://example.com/doc.pdf', 'Approved', GETUTCDATE());

    IF NOT EXISTS (SELECT 1 FROM dbo.TutorSubjects WHERE TutorId = @TargetUserId)
        INSERT INTO dbo.TutorSubjects (TutorId, SubjectId, TeachingLevel, FeePerSessionCredits, IsActive)
        VALUES (@TargetUserId, 1, N'THPT', 100, 1);

    DECLARE @TutorSubId INT;
    SELECT TOP 1 @TutorSubId = Id FROM dbo.TutorSubjects WHERE TutorId = @TargetUserId;

    -- Lấy danh sách các Student khác nhau
    DECLARE @StudentA INT, @StudentB INT, @StudentC INT, @StudentD INT;
    
    SELECT @StudentA = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.Users WHERE [Role] = 'Student' AND Id <> @TargetUserId) t WHERE RowNum = 1;
    SELECT @StudentB = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.Users WHERE [Role] = 'Student' AND Id <> @TargetUserId) t WHERE RowNum = 2;
    SELECT @StudentC = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.Users WHERE [Role] = 'Student' AND Id <> @TargetUserId) t WHERE RowNum = 3;
    SELECT @StudentD = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.Users WHERE [Role] = 'Student' AND Id <> @TargetUserId) t WHERE RowNum = 4;

    -- Fallback nếu không đủ 4 student riêng biệt
    SET @StudentB = ISNULL(@StudentB, @StudentA);
    SET @StudentC = ISNULL(@StudentC, @StudentA);
    SET @StudentD = ISNULL(@StudentD, @StudentA);

    -- Insert Completed Bookings (Mỗi học sinh 1 buổi)
    INSERT INTO dbo.Bookings (StudentId, TutorSubjectId, StartTimeUtc, EndTimeUtc, CreditCost, Status, StudentNote, MeetingUrl)
    VALUES 
    (@StudentA, @TutorSubId, '2026-08-15 10:00:00', '2026-08-15 11:00:00', 100, 'Completed', N'Buổi học hoàn thành tốt.', N'https://meet.google.com/tutor-meet-01'),
    (@StudentB, @TutorSubId, '2026-08-18 14:00:00', '2026-08-18 15:00:00', 100, 'Completed', N'Ôn tập kiến thức cơ bản.', N'https://meet.google.com/tutor-meet-02');

    -- Insert Confirmed Bookings (Học sinh khác)
    INSERT INTO dbo.Bookings (StudentId, TutorSubjectId, StartTimeUtc, EndTimeUtc, CreditCost, Status, StudentNote, MeetingUrl)
    VALUES 
    (@StudentC, @TutorSubId, '2026-08-27 10:00:00', '2026-08-27 11:00:00', 100, 'Confirmed', N'Lịch học tuần tới.', N'https://meet.google.com/tutor-meet-03'),
    (@StudentD, @TutorSubId, '2026-08-30 14:00:00', '2026-08-30 15:00:00', 100, 'Confirmed', N'Chuẩn bị kiểm tra.', N'https://meet.google.com/tutor-meet-04');

    PRINT N'Đã thêm các Bookings đa dạng Học sinh cho TUTOR t@gmail.com!';
END


/* =========================================================
   TRƯỜNG HỢP 2: t@gmail.com LÀ STUDENT 
   -> Ghép lịch với NHIỀU GIA SƯ / MÔN HỌC KHÁC NHAU
   ========================================================= */
ELSE IF @TargetRole = 'Student'
BEGIN
    -- Lấy 4 TutorSubjectId thuộc các Gia sư khác nhau
    DECLARE @TutorSub1 INT, @TutorSub2 INT, @TutorSub3 INT, @TutorSub4 INT;

    SELECT @TutorSub1 = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.TutorSubjects WHERE IsActive = 1) t WHERE RowNum = 1;
    SELECT @TutorSub2 = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.TutorSubjects WHERE IsActive = 1) t WHERE RowNum = 2;
    SELECT @TutorSub3 = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.TutorSubjects WHERE IsActive = 1) t WHERE RowNum = 3;
    SELECT @TutorSub4 = Id FROM (SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum FROM dbo.TutorSubjects WHERE IsActive = 1) t WHERE RowNum = 4;

    -- Fallback nếu ít môn học
    SET @TutorSub2 = ISNULL(@TutorSub2, @TutorSub1);
    SET @TutorSub3 = ISNULL(@TutorSub3, @TutorSub1);
    SET @TutorSub4 = ISNULL(@TutorSub4, @TutorSub1);

    -- 1. Bookings Completed (Chưa review, chưa complaint) - 2 Gia sư khác nhau
    INSERT INTO dbo.Bookings (StudentId, TutorSubjectId, StartTimeUtc, EndTimeUtc, CreditCost, Status, StudentNote, MeetingUrl)
    VALUES 
    (@TargetUserId, @TutorSub1, '2026-08-16 09:00:00', '2026-08-16 10:00:00', 80, 'Completed', N'Buổi học môn thứ nhất đã xong.', N'https://meet.google.com/student-meet-01'),
    (@TargetUserId, @TutorSub2, '2026-08-19 15:00:00', '2026-08-19 16:00:00', 90, 'Completed', N'Buổi học với Gia sư thứ hai.', N'https://meet.google.com/student-meet-02');

    -- 2. Bookings Confirmed (Chưa cancel) - 2 Gia sư khác nhau nữa
    INSERT INTO dbo.Bookings (StudentId, TutorSubjectId, StartTimeUtc, EndTimeUtc, CreditCost, Status, StudentNote, MeetingUrl)
    VALUES 
    (@TargetUserId, @TutorSub3, '2026-08-28 09:00:00', '2026-08-28 10:00:00', 85, 'Confirmed', N'Lịch học với Gia sư thứ ba.', N'https://meet.google.com/student-meet-03'),
    (@TargetUserId, @TutorSub4, '2026-08-31 15:00:00', '2026-08-31 16:00:00', 100, 'Confirmed', N'Lịch học với Gia sư thứ tư.', N'https://meet.google.com/student-meet-04');

    PRINT N'Đã thêm các Bookings đa dạng Gia sư cho STUDENT t@gmail.com!';
END
GO


/* =========================================================
   VERIFY KẾT QUẢ VỪA THÊM (Xem danh sách các Gia sư khác nhau)
   ========================================================= */
SELECT 
    b.Id AS BookingId,
    s.FullName AS StudentName,
    s.Email AS StudentEmail,
    t_user.FullName AS TutorName,
    t_user.Email AS TutorEmail,
    sub.Name AS SubjectName,
    b.StartTimeUtc,
    b.Status,
    CASE WHEN r.Id IS NOT NULL THEN N'Đã Review' ELSE N'Chưa Review' END AS ReviewStatus,
    CASE WHEN c.Id IS NOT NULL THEN N'Đã Complaint' ELSE N'Chưa Complaint' END AS ComplaintStatus
FROM dbo.Bookings b
JOIN dbo.Users s ON s.Id = b.StudentId
JOIN dbo.TutorSubjects ts ON ts.Id = b.TutorSubjectId
JOIN dbo.Users t_user ON t_user.Id = ts.TutorId
JOIN dbo.Subjects sub ON sub.Id = ts.SubjectId
LEFT JOIN dbo.Reviews r ON r.BookingId = b.Id
LEFT JOIN dbo.Complaints c ON c.BookingId = b.Id
WHERE s.Email = 't@gmail.com' OR t_user.Email = 't@gmail.com'
ORDER BY b.Id DESC;
GO