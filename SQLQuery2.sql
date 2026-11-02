USE TutorConnectDb;
GO

UPDATE dbo.Users
SET Role = 'Admin',
    EmailVerifiedAtUtc = GETUTCDATE(),
    Status = 'Active'
WHERE Email = '23001580@hus.edu.vn';
GO

SET NOCOUNT ON;
GO

/* =========================================================
   0. CLEAN EXISTING TEST DATA
   ========================================================= */

DELETE FROM dbo.RefreshTokens;
DELETE FROM dbo.PasswordResetTokens;
DELETE FROM dbo.EmailVerificationTokens;
DELETE FROM dbo.Complaints;
DELETE FROM dbo.Reviews;
DELETE FROM dbo.SessionProgress;
DELETE FROM dbo.RescheduleRequests;
DELETE FROM dbo.LearningMilestones;
DELETE FROM dbo.LearningGoals;
DELETE FROM dbo.Bookings;
DELETE FROM dbo.TutorAvailabilities;
DELETE FROM dbo.TutorSubjects;
DELETE FROM dbo.TutorProfiles;
DELETE FROM dbo.Subjects;
DELETE FROM dbo.Users;
GO


/* =========================================================
   1. USERS
   ========================================================= */

SET IDENTITY_INSERT dbo.Users ON;

INSERT INTO dbo.Users
(
    Id,
    Email,
    PasswordHash,
    FullName,
    Phone,
    Role,
    Status,
    EmailVerifiedAtUtc,
    TimeZoneId
)
VALUES
-- Admins
(1,
 'admin@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Nguyễn Admin',
 '0901000001',
 'Admin',
 'Active',
 '2026-08-01 08:00:00',
 'Asia/Ho_Chi_Minh'),

(2,
 'admin2@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Trần Admin',
 '0901000002',
 'Admin',
 'Active',
 '2026-08-01 08:05:00',
 'Asia/Ho_Chi_Minh'),

-- Tutors
(3,
 'lan.math@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Nguyễn Lan',
 '0902000001',
 'Tutor',
 'Active',
 '2026-08-05 08:00:00',
 'Asia/Ho_Chi_Minh'),

(4,
 'minh.physics@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Lê Minh',
 '0902000002',
 'Tutor',
 'Active',
 '2026-08-05 08:10:00',
 'Asia/Ho_Chi_Minh'),

(5,
 'hoa.english@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Phạm Hoa',
 '0902000003',
 'Tutor',
 'Active',
 '2026-08-05 08:20:00',
 'Asia/Ho_Chi_Minh'),

(6,
 'nam.programming@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Đỗ Nam',
 '0902000004',
 'Tutor',
 'Active',
 '2026-08-05 08:30:00',
 'Asia/Ho_Chi_Minh'),

-- Students
(7,
 't@gmail.com',
 '$2a$12$1pcCxfqtRECBiUZDjwN70eq8CvyIV.G6UvYxl.Thu9oWgvpSHMCCu',
 N'Nguyễn Minh Anh',
 '0903000001',
 'Student',
 'Active',
 '2026-08-06 09:00:00',
 'Asia/Ho_Chi_Minh'),

(8,
 'student2@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Trần Hoàng Nam',
 '0903000002',
 'Student',
 'Active',
 '2026-08-06 09:10:00',
 'Asia/Ho_Chi_Minh'),

(9,
 'student3@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Lê Thu Hà',
 '0903000003',
 'Student',
 'Active',
 '2026-08-06 09:20:00',
 'Asia/Ho_Chi_Minh'),

(10,
 'student4@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Phạm Đức Anh',
 '0903000004',
 'Student',
 'Active',
 '2026-08-06 09:30:00',
 'Asia/Ho_Chi_Minh'),

(11,
 'student5@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 N'Vũ Khánh Linh',
 '0903000005',
 'Student',
 'Active',
 '2026-08-06 09:40:00',
 'Asia/Ho_Chi_Minh');

SET IDENTITY_INSERT dbo.Users OFF;
GO


/* =========================================================
   2. SUBJECTS
   ========================================================= */

SET IDENTITY_INSERT dbo.Subjects ON;

INSERT INTO dbo.Subjects
(
    Id,
    Code,
    Name,
    Description,
    IsActive
)
VALUES
(1, 'MATH', N'Toán', N'Toán học các cấp.', 1),
(2, 'PHYS', N'Vật lý', N'Vật lý THPT.', 1),
(3, 'ENG', N'Tiếng Anh', N'Tiếng Anh giao tiếp và học thuật.', 1),
(4, 'CS', N'Lập trình', N'Lập trình và khoa học máy tính.', 1),
(5, 'CHEM', N'Hóa học', N'Hóa học THPT.', 1),
(6, 'IELTS', N'IELTS', N'Luyện thi IELTS.', 1);

SET IDENTITY_INSERT dbo.Subjects OFF;
GO


/* =========================================================
   3. TUTOR PROFILES
   ========================================================= */

DELETE FROM dbo.TutorProfiles;
GO

INSERT INTO dbo.TutorProfiles
(
    UserId,
    Bio,
    Qualification,
    ExperienceYears,
    VerificationDocumentUrl,
    ApprovalStatus,
    ReviewNote,
    SubmittedAtUtc,
    ReviewedByAdminId,
    ReviewedAtUtc
)
VALUES
-- Approved
(3,
 N'Gia sư Toán chuyên luyện thi THPT và đại học.',
 N'Cử nhân Toán học',
 4,
 N'https://example.com/docs/tutor-3.pdf',
 'Approved',
 N'Hồ sơ đã được xác minh.',
 '2026-08-08 08:00:00',
 1,
 '2026-08-09 09:00:00'),

-- Approved
(4,
 N'Gia sư Vật lý với kinh nghiệm luyện thi THPT.',
 N'Cử nhân Vật lý',
 5,
 N'https://example.com/docs/tutor-4.pdf',
 'Approved',
 N'Hồ sơ đạt yêu cầu.',
 '2026-08-08 08:10:00',
 1,
 '2026-08-09 09:10:00'),

-- Pending
(5,
 N'Gia sư Tiếng Anh và IELTS.',
 N'IELTS 8.0',
 3,
 N'https://example.com/docs/tutor-5.pdf',
 'Approved',
 N'Hồ sơ đạt yêu cầu.',
 '2026-08-08 08:10:00',
 1,
 '2026-08-09 09:10:00'),

-- Draft
(6,
 N'Kỹ sư phần mềm, hướng dẫn lập trình cho sinh viên.',
 N'Kỹ sư Công nghệ Thông tin',
 2,
 NULL,
 'Draft',
 NULL,
 NULL,
 NULL,
 NULL);

GO


/* =========================================================
   4. TUTOR SUBJECTS
   ========================================================= */

SET IDENTITY_INSERT dbo.TutorSubjects ON;

INSERT INTO dbo.TutorSubjects
(
    Id,
    TutorId,
    SubjectId,
    TeachingLevel,
    FeePerSessionCredits,
    IsActive
)
VALUES
(1, 3, 1, N'THPT', 80, 1),
(2, 3, 5, N'THCS', 70, 1),
(3, 4, 2, N'THPT', 90, 1),
(4, 5, 3, N'THPT', 85, 1),
(5, 5, 6, N'IELTS', 120, 1),
(6, 6, 4, N'Đại học', 100, 1);

SET IDENTITY_INSERT dbo.TutorSubjects OFF;
GO


/* =========================================================
   5. TUTOR AVAILABILITIES
   DayOfWeek:
   0 = Sunday
   1 = Monday
   2 = Tuesday
   ...
   6 = Saturday
   ========================================================= */

SET IDENTITY_INSERT dbo.TutorAvailabilities ON;

INSERT INTO dbo.TutorAvailabilities
(
    Id,
    TutorId,
    DayOfWeek,
    StartTime,
    EndTime,
    IsActive
)
VALUES
(1, 3, 1, '18:00', '20:00', 1),
(2, 3, 3, '18:00', '20:00', 1),
(3, 3, 6, '09:00', '11:00', 1),

(4, 4, 2, '18:00', '20:00', 1),
(5, 4, 5, '18:00', '20:00', 1),
(6, 4, 0, '09:00', '11:00', 1),

(7, 5, 1, '19:00', '21:00', 1),
(8, 5, 4, '19:00', '21:00', 1),

(9, 6, 3, '19:00', '21:00', 1),
(10, 6, 6, '14:00', '16:00', 1);

SET IDENTITY_INSERT dbo.TutorAvailabilities OFF;
GO


/* =========================================================
   6. LEARNING GOALS
   ========================================================= */

SET IDENTITY_INSERT dbo.LearningGoals ON;

INSERT INTO dbo.LearningGoals
(
    Id,
    StudentId,
    TutorSubjectId,
    Title,
    Description,
    TargetDate,
    Status
)
VALUES
(1,
 7,
 1,
 N'Nắm vững Đại số THPT',
 N'Cải thiện kỹ năng giải phương trình và bất phương trình.',
 '2026-12-01',
 'InProgress'),

(2,
 8,
 3,
 N'Ôn thi Vật lý THPT',
 N'Nắm chắc cơ học và điện học.',
 '2026-11-15',
 'NotStarted'),

(3,
 9,
 5,
 N'IELTS Overall 7.0',
 N'Cải thiện cả 4 kỹ năng IELTS.',
 '2027-01-15',
 'InProgress'),

(4,
 10,
 6,
 N'Học lập trình C#',
 N'Nắm được OOP và ASP.NET Core cơ bản.',
 '2026-12-20',
 'Completed');

SET IDENTITY_INSERT dbo.LearningGoals OFF;
GO


/* =========================================================
   7. LEARNING MILESTONES
   ========================================================= */

SET IDENTITY_INSERT dbo.LearningMilestones ON;

INSERT INTO dbo.LearningMilestones
(
    Id,
    LearningGoalId,
    Title,
    Description,
    TargetDate,
    OrderNumber,
    Status
)
VALUES
(1, 1, N'Đại số cơ bản', N'Ôn lại kiến thức nền tảng.', '2026-09-01', 1, 'Completed'),
(2, 1, N'Phương trình', N'Luyện phương trình bậc hai.', '2026-10-01', 2, 'InProgress'),
(3, 1, N'Bất phương trình', N'Luyện bài tập nâng cao.', '2026-11-01', 3, 'NotStarted'),

(4, 2, N'Cơ học', N'Ôn động lực học.', '2026-09-15', 1, 'NotStarted'),
(5, 2, N'Điện học', N'Ôn điện trường và dòng điện.', '2026-10-15', 2, 'NotStarted'),

(6, 3, N'Listening', N'Luyện nghe IELTS.', '2026-09-15', 1, 'Completed'),
(7, 3, N'Reading', N'Luyện đọc IELTS.', '2026-10-01', 2, 'InProgress'),
(8, 3, N'Writing', N'Luyện viết Task 1 và Task 2.', '2026-11-01', 3, 'InProgress'),
(9, 3, N'Speaking', N'Luyện Speaking Part 1-3.', '2026-12-01', 4, 'NotStarted'),

(10, 4, N'C# Fundamentals', N'Cú pháp và OOP.', '2026-09-01', 1, 'Completed'),
(11, 4, N'ASP.NET Core', N'Web API cơ bản.', '2026-10-01', 2, 'Completed');

SET IDENTITY_INSERT dbo.LearningMilestones OFF;
GO


/* =========================================================
   8. BOOKINGS
   ========================================================= */

SET IDENTITY_INSERT dbo.Bookings ON;

INSERT INTO dbo.Bookings
(
    Id,
    StudentId,
    TutorSubjectId,
    StartTimeUtc,
    EndTimeUtc,
    CreditCost,
    Status,
    StudentNote,
    MeetingUrl,
    StatusReason,
    CancelledByUserId
)
VALUES

-- Pending
(1,
 7,
 1,
 '2026-08-20 11:00:00',
 '2026-08-20 12:00:00',
 80,
 'Pending',
 N'Mình muốn ôn phương trình bậc hai.',
 NULL,
 NULL,
 NULL),

-- Confirmed
(2,
 8,
 3,
 '2026-08-21 11:00:00',
 '2026-08-21 12:00:00',
 90,
 'Confirmed',
 N'Ôn tập chương cơ học.',
 N'https://meet.google.com/tutorconnect-demo',
 NULL,
 NULL),

-- Rejected
(3,
 9,
 5,
 '2026-08-22 12:00:00',
 '2026-08-22 13:00:00',
 120,
 'Rejected',
 N'Mình muốn luyện Speaking.',
 NULL,
 N'Tutor không có lịch phù hợp vào thời gian này.',
 NULL),

-- Cancelled
(4,
 10,
 6,
 '2026-08-23 12:00:00',
 '2026-08-23 13:00:00',
 100,
 'Cancelled',
 N'Học C# OOP.',
 NULL,
 N'Sinh viên xin hủy lịch.',
 10),

-- Completed
(5,
 7,
 1,
 '2026-08-10 11:00:00',
 '2026-08-10 12:00:00',
 80,
 'Completed',
 N'Ôn phương trình.',
 NULL,
 NULL,
 NULL),

-- Completed
(6,
 9,
 5,
 '2026-08-11 12:00:00',
 '2026-08-11 13:00:00',
 120,
 'Completed',
 N'Luyện IELTS Writing.',
 NULL,
 NULL,
 NULL),

-- Confirmed
(7,
 10,
 6,
 '2026-08-25 12:00:00',
 '2026-08-25 13:00:00',
 100,
 N'Confirmed',
 N'Luyện ASP.NET Core.',
 N'https://meet.google.com/tutorconnect-demo-2',
 NULL,
 NULL);

SET IDENTITY_INSERT dbo.Bookings OFF;
GO


/* =========================================================
   9. RESCHEDULE REQUESTS
   ========================================================= */

SET IDENTITY_INSERT dbo.RescheduleRequests ON;

INSERT INTO dbo.RescheduleRequests
(
    Id,
    BookingId,
    RequestedByUserId,
    OriginalStartTimeUtc,
    OriginalEndTimeUtc,
    ProposedStartTimeUtc,
    ProposedEndTimeUtc,
    Reason,
    Status,
    RespondedByUserId,
    ResponseNote,
    RequestedAtUtc
)
VALUES
-- Pending
(1,
 2,
 8,
 '2026-08-21 11:00:00',
 '2026-08-21 12:00:00',
 '2026-08-21 13:00:00',
 '2026-08-21 14:00:00',
 N'Sinh viên có lịch học đột xuất.',
 'Pending',
 NULL,
 NULL,
 '2026-08-17 09:00:00'),

-- Accepted
(2,
 7,
 10,
 '2026-08-25 12:00:00',
 '2026-08-25 13:00:00',
 '2026-08-26 12:00:00',
 '2026-08-26 13:00:00',
 N'Muốn đổi sang ngày hôm sau.',
 'Accepted',
 6,
 N'Tutor đồng ý đổi lịch.',
 '2026-08-16 10:00:00'),

-- Rejected
(3,
 5,
 7,
 '2026-08-10 11:00:00',
 '2026-08-10 12:00:00',
 '2026-08-10 13:00:00',
 '2026-08-10 14:00:00',
 N'Đề nghị đổi giờ.',
 'Rejected',
 3,
 N'Tutor không còn lịch trống.',
 '2026-08-09 10:00:00');

SET IDENTITY_INSERT dbo.RescheduleRequests OFF;
GO


/* =========================================================
   10. SESSION PROGRESS
   ========================================================= */

INSERT INTO dbo.SessionProgress
(
    BookingId,
    LearningGoalId,
    Score,
    MaxScore,
    GoalProgressPercent,
    TutorComment
)
VALUES
(
    5,
    1,
    8.5,
    10,
    65.00,
    N'Sinh viên đã tiến bộ tốt về phương trình bậc hai.'
),
(
    6,
    3,
    7.0,
    9,
    70.00,
    N'Writing đã cải thiện, cần tiếp tục luyện Task 2.'
);
GO


/* =========================================================
   11. REVIEWS
   ========================================================= */

SET IDENTITY_INSERT dbo.Reviews ON;

INSERT INTO dbo.Reviews
(
    Id,
    BookingId,
    ReviewerId,
    Rating,
    Comment
)
VALUES
(
    1,
    5,
    7,
    5,
    N'Tutor giảng dễ hiểu và rất nhiệt tình.'
),
(
    2,
    6,
    9,
    4,
    N'Buổi học hữu ích, tutor phản hồi khá chi tiết.'
);

SET IDENTITY_INSERT dbo.Reviews OFF;
GO


/* =========================================================
   12. COMPLAINTS
   ========================================================= */

SET IDENTITY_INSERT dbo.Complaints ON;

INSERT INTO dbo.Complaints
(
    Id,
    CreatedByUserId,
    AgainstUserId,
    BookingId,
    Type,
    Description,
    EvidenceUrl,
    Status,
    AdminResponse,
    ResolvedByAdminId,
    SubmittedAtUtc,
    ResolvedAtUtc
)
VALUES

-- Open
(
    1,
    7,
    3,
    5,
    N'LessonQuality',
    N'Tutor cần giải thích chi tiết hơn ở một số phần.',
    NULL,
    'Open',
    NULL,
    NULL,
    '2026-08-12 09:00:00',
    NULL
),

-- InReview
(
    2,
    8,
    4,
    2,
    N'Schedule',
    N'Tutor thay đổi lịch học mà chưa thông báo rõ.',
    N'https://example.com/evidence/complaint-2.png',
    'InReview',
    NULL,
    NULL,
    '2026-08-13 10:00:00',
    NULL
),

-- Resolved
(
    3,
    9,
    5,
    6,
    N'LessonQuality',
    N'Nội dung buổi học không hoàn toàn đúng với mô tả.',
    NULL,
    'Resolved',
    N'Admin đã trao đổi với tutor và xác nhận vấn đề đã được xử lý.',
    1,
    '2026-08-11 14:00:00',
    '2026-08-12 09:00:00'
),

-- Rejected
(
    4,
    10,
    6,
    4,
    N'Other',
    N'Khiếu nại không có đủ bằng chứng xác thực.',
    NULL,
    'Rejected',
    N'Admin không thể xác nhận nội dung khiếu nại dựa trên thông tin hiện có.',
    2,
    '2026-08-12 15:00:00',
    '2026-08-13 08:00:00'
);

SET IDENTITY_INSERT dbo.Complaints OFF;
GO


/* =========================================================
   13. EMAIL VERIFICATION TOKENS
   ========================================================= */

SET IDENTITY_INSERT dbo.EmailVerificationTokens ON;

INSERT INTO dbo.EmailVerificationTokens
(
    Id,
    UserId,
    TokenHash,
    ExpiresAtUtc,
    VerifiedAtUtc
)
VALUES
(
    1,
    7,
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '2026-08-18 09:00:00',
    NULL
),
(
    2,
    8,
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    '2026-08-18 09:10:00',
    '2026-08-07 09:10:00'
);

SET IDENTITY_INSERT dbo.EmailVerificationTokens OFF;
GO


/* =========================================================
   14. PASSWORD RESET TOKENS
   ========================================================= */

SET IDENTITY_INSERT dbo.PasswordResetTokens ON;

INSERT INTO dbo.PasswordResetTokens
(
    Id,
    UserId,
    TokenHash,
    ExpiresAtUtc,
    UsedAtUtc
)
VALUES
(
    1,
    7,
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    '2026-08-17 22:00:00',
    NULL
),
(
    2,
    8,
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    '2026-08-16 10:00:00',
    '2026-08-16 09:30:00'
);

SET IDENTITY_INSERT dbo.PasswordResetTokens OFF;
GO


/* =========================================================
   15. REFRESH TOKENS
   ========================================================= */

SET IDENTITY_INSERT dbo.RefreshTokens ON;

INSERT INTO dbo.RefreshTokens
(
    Id,
    UserId,
    TokenHash,
    ExpiresAtUtc,
    RevokedAtUtc
)
VALUES
(
    1,
    7,
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    '2026-09-17 10:00:00',
    NULL
),
(
    2,
    8,
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    '2026-09-17 10:00:00',
    NULL
),
(
    3,
    3,
    '1111111111111111111111111111111111111111111111111111111111111111',
    '2026-09-17 10:00:00',
    NULL
),
(
    4,
    4,
    '2222222222222222222222222222222222222222222222222222222222222222',
    '2026-09-17 10:00:00',
    '2026-08-15 10:00:00'
);

SET IDENTITY_INSERT dbo.RefreshTokens OFF;
GO


/* =========================================================
   16. VERIFY DATA
   ========================================================= */

SELECT 'Users' AS [Table], COUNT(*) AS [Count] FROM dbo.Users
UNION ALL
SELECT 'Subjects', COUNT(*) FROM dbo.Subjects
UNION ALL
SELECT 'TutorProfiles', COUNT(*) FROM dbo.TutorProfiles
UNION ALL
SELECT 'TutorSubjects', COUNT(*) FROM dbo.TutorSubjects
UNION ALL
SELECT 'TutorAvailabilities', COUNT(*) FROM dbo.TutorAvailabilities
UNION ALL
SELECT 'LearningGoals', COUNT(*) FROM dbo.LearningGoals
UNION ALL
SELECT 'LearningMilestones', COUNT(*) FROM dbo.LearningMilestones
UNION ALL
SELECT 'Bookings', COUNT(*) FROM dbo.Bookings
UNION ALL
SELECT 'RescheduleRequests', COUNT(*) FROM dbo.RescheduleRequests
UNION ALL
SELECT 'SessionProgress', COUNT(*) FROM dbo.SessionProgress
UNION ALL
SELECT 'Reviews', COUNT(*) FROM dbo.Reviews
UNION ALL
SELECT 'Complaints', COUNT(*) FROM dbo.Complaints
UNION ALL
SELECT 'EmailVerificationTokens', COUNT(*) FROM dbo.EmailVerificationTokens
UNION ALL
SELECT 'PasswordResetTokens', COUNT(*) FROM dbo.PasswordResetTokens
UNION ALL
SELECT 'RefreshTokens', COUNT(*) FROM dbo.RefreshTokens;
GO


/* =========================================================
   17. QUICK CHECK
   ========================================================= */

SELECT
    u.Id,
    u.FullName,
    u.Email,
    u.Role,
    u.Status
FROM dbo.Users u
ORDER BY u.Id;
GO

SELECT
    tp.UserId,
    u.FullName,
    tp.ApprovalStatus,
    tp.SubmittedAtUtc,
    tp.ReviewedByAdminId,
    tp.ReviewedAtUtc
FROM dbo.TutorProfiles tp
JOIN dbo.Users u ON u.Id = tp.UserId
ORDER BY tp.UserId;
GO

SELECT
    b.Id,
    s.FullName AS Student,
    sub.Name AS Subject,
    b.StartTimeUtc,
    b.EndTimeUtc,
    b.CreditCost,
    b.Status
FROM dbo.Bookings b
JOIN dbo.Users s ON s.Id = b.StudentId
JOIN dbo.TutorSubjects ts ON ts.Id = b.TutorSubjectId
JOIN dbo.Subjects sub ON sub.Id = ts.SubjectId
ORDER BY b.Id;
GO

/* =========================================================
   ADD EXTRA TUTORS FOR SEARCH TEST
   ========================================================= */

SET IDENTITY_INSERT dbo.Users ON;

INSERT INTO dbo.Users
(
    Id,
    Email,
    PasswordHash,
    FullName,
    Phone,
    Role,
    Status,
    EmailVerifiedAtUtc,
    TimeZoneId
)
VALUES
(
    12,
    'thuy.english@tutorconnect.com',
    '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5',
    N'Nguyễn Thùy',
    '0902000012',
    'Tutor',
    'Active',
    '2026-08-10 08:00:00',
    'Asia/Ho_Chi_Minh'
),
(
    13,
    'linh.english@tutorconnect.com',
    '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5',
    N'Trần Linh',
    '0902000013',
    'Tutor',
    'Active',
    '2026-08-10 08:10:00',
    'Asia/Ho_Chi_Minh'
);

SET IDENTITY_INSERT dbo.Users OFF;
GO