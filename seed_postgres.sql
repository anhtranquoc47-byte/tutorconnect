BEGIN;

TRUNCATE "RefreshTokens", "PasswordResetTokens", "Complaints", "Reviews", "SessionProgress", "RescheduleRequests", "LearningMilestones", "LearningGoals", "Bookings", "TutorAvailabilities", "TutorSubjects", "TutorProfiles", "Subjects", "Users" RESTART IDENTITY CASCADE;


/* =========================================================
   0. CLEAN EXISTING TEST DATA
   ========================================================= */

/* =========================================================
   1. USERS
   ========================================================= */


INSERT INTO "Users"
(
    "Id",
    "Email",
    "PasswordHash",
    "FullName",
    "Phone",
    "Role",
    "Status",
    "TimeZoneId"
)
VALUES
-- Admins
(1,
 'admin@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Nguyễn Admin',
 '0901000001',
 'Admin',
 'Active',
 'Asia/Ho_Chi_Minh'),

(2,
 'admin2@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Trần Admin',
 '0901000002',
 'Admin',
 'Active',
 'Asia/Ho_Chi_Minh'),

-- Tutors
(3,
 'lan.math@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Nguyễn Lan',
 '0902000001',
 'Tutor',
 'Active',
 'Asia/Ho_Chi_Minh'),

(4,
 'minh.physics@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Lê Minh',
 '0902000002',
 'Tutor',
 'Active',
 'Asia/Ho_Chi_Minh'),

(5,
 'hoa.english@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Phạm Hoa',
 '0902000003',
 'Tutor',
 'Active',
 'Asia/Ho_Chi_Minh'),

(6,
 'nam.programming@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Đỗ Nam',
 '0902000004',
 'Tutor',
 'Active',
 'Asia/Ho_Chi_Minh'),

-- Students
(7,
 't@gmail.com',
 '$2a$12$1pcCxfqtRECBiUZDjwN70eq8CvyIV.G6UvYxl.Thu9oWgvpSHMCCu',
 'Nguyễn Minh Anh',
 '0903000001',
 'Student',
 'Active',
 'Asia/Ho_Chi_Minh'),

(8,
 'student2@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Trần Hoàng Nam',
 '0903000002',
 'Student',
 'Active',
 'Asia/Ho_Chi_Minh'),

(9,
 'student3@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Lê Thu Hà',
 '0903000003',
 'Student',
 'Active',
 'Asia/Ho_Chi_Minh'),

(10,
 'student4@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Phạm Đức Anh',
 '0903000004',
 'Student',
 'Active',
 'Asia/Ho_Chi_Minh'),

(11,
 'student5@tutorconnect.com',
 '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5X5',
 'Vũ Khánh Linh',
 '0903000005',
 'Student',
 'Active',
 'Asia/Ho_Chi_Minh');



/* =========================================================
   2. SUBJECTS
   ========================================================= */


INSERT INTO "Subjects"
(
    "Id",
    "Code",
    "Name",
    "Description",
    "IsActive"
)
VALUES
(1, 'MATH', 'Toán', 'Toán học các cấp.', true),
(2, 'PHYS', 'Vật lý', 'Vật lý THPT.', true),
(3, 'ENG', 'Tiếng Anh', 'Tiếng Anh giao tiếp và học thuật.', true),
(4, 'CS', 'Lập trình', 'Lập trình và khoa học máy tính.', true),
(5, 'CHEM', 'Hóa học', 'Hóa học THPT.', true),
(6, 'IELTS', 'IELTS', 'Luyện thi IELTS.', true);



/* =========================================================
   3. TUTOR PROFILES
   ========================================================= */

INSERT INTO "TutorProfiles"
(
    "UserId",
    "Bio",
    "Qualification",
    "ExperienceYears",
    "VerificationDocumentUrl",
    "ApprovalStatus",
    "ReviewNote",
    "SubmittedAtUtc",
    "ReviewedByAdminId",
    "ReviewedAtUtc"
)
VALUES
-- Approved
(3,
 'Gia sư Toán chuyên luyện thi THPT và đại học.',
 'Cử nhân Toán học',
 4,
 'https://example.com/docs/tutor-3.pdf',
 'Approved',
 'Hồ sơ đã được xác minh.',
 '2026-08-08 08:00:00',
 1,
 '2026-08-09 09:00:00'),

-- Approved
(4,
 'Gia sư Vật lý với kinh nghiệm luyện thi THPT.',
 'Cử nhân Vật lý',
 5,
 'https://example.com/docs/tutor-4.pdf',
 'Approved',
 'Hồ sơ đạt yêu cầu.',
 '2026-08-08 08:10:00',
 1,
 '2026-08-09 09:10:00'),

-- Pending
(5,
 'Gia sư Tiếng Anh và IELTS.',
 'IELTS 8.0',
 3,
 'https://example.com/docs/tutor-5.pdf',
 'Approved',
 'Hồ sơ đạt yêu cầu.',
 '2026-08-08 08:10:00',
 1,
 '2026-08-09 09:10:00'),

-- Draft
(6,
 'Kỹ sư phần mềm, hướng dẫn lập trình cho sinh viên.',
 'Kỹ sư Công nghệ Thông tin',
 2,
 NULL,
 'Draft',
 NULL,
 NULL,
 NULL,
 NULL);



/* =========================================================
   4. TUTOR SUBJECTS
   ========================================================= */


INSERT INTO "TutorSubjects"
(
    "Id",
    "TutorId",
    "SubjectId",
    "TeachingLevel",
    "FeePerSessionCredits",
    "IsActive"
)
VALUES
(1, 3, 1, 'THPT', 80, true),
(2, 3, 5, 'THCS', 70, true),
(3, 4, 2, 'THPT', 90, true),
(4, 5, 3, 'THPT', 85, true),
(5, 5, 6, 'IELTS', 120, true),
(6, 6, 4, 'Đại học', 100, true);



/* =========================================================
   5. TUTOR AVAILABILITIES
   DayOfWeek:
   0 = Sunday
   1 = Monday
   2 = Tuesday
   ...
   6 = Saturday
   ========================================================= */


INSERT INTO "TutorAvailabilities"
(
    "Id",
    "TutorId",
    "DayOfWeek",
    "StartTime",
    "EndTime",
    "IsActive"
)
VALUES
(1, 3, 1, '18:00', '20:00', true),
(2, 3, 3, '18:00', '20:00', true),
(3, 3, 6, '09:00', '11:00', true),

(4, 4, 2, '18:00', '20:00', true),
(5, 4, 5, '18:00', '20:00', true),
(6, 4, 0, '09:00', '11:00', true),

(7, 5, 1, '19:00', '21:00', true),
(8, 5, 4, '19:00', '21:00', true),

(9, 6, 3, '19:00', '21:00', true),
(10, 6, 6, '14:00', '16:00', true);



/* =========================================================
   6. LEARNING GOALS
   ========================================================= */


INSERT INTO "LearningGoals"
(
    "Id",
    "StudentId",
    "TutorSubjectId",
    "Title",
    "Description",
    "TargetDate",
    "Status"
)
VALUES
(1,
 7,
 1,
 'Nắm vững Đại số THPT',
 'Cải thiện kỹ năng giải phương trình và bất phương trình.',
 '2026-12-01',
 'InProgress'),

(2,
 8,
 3,
 'Ôn thi Vật lý THPT',
 'Nắm chắc cơ học và điện học.',
 '2026-11-15',
 'NotStarted'),

(3,
 9,
 5,
 'IELTS Overall 7.0',
 'Cải thiện cả 4 kỹ năng IELTS.',
 '2027-01-15',
 'InProgress'),

(4,
 10,
 6,
 'Học lập trình C#',
 'Nắm được OOP và ASP.NET Core cơ bản.',
 '2026-12-20',
 'Completed');



/* =========================================================
   7. LEARNING MILESTONES
   ========================================================= */


INSERT INTO "LearningMilestones"
(
    "Id",
    "LearningGoalId",
    "Title",
    "Description",
    "TargetDate",
    "OrderNumber",
    "Status"
)
VALUES
(1, 1, 'Đại số cơ bản', 'Ôn lại kiến thức nền tảng.', '2026-09-01', 1, 'Completed'),
(2, 1, 'Phương trình', 'Luyện phương trình bậc hai.', '2026-10-01', 2, 'InProgress'),
(3, 1, 'Bất phương trình', 'Luyện bài tập nâng cao.', '2026-11-01', 3, 'NotStarted'),

(4, 2, 'Cơ học', 'Ôn động lực học.', '2026-09-15', 1, 'NotStarted'),
(5, 2, 'Điện học', 'Ôn điện trường và dòng điện.', '2026-10-15', 2, 'NotStarted'),

(6, 3, 'Listening', 'Luyện nghe IELTS.', '2026-09-15', 1, 'Completed'),
(7, 3, 'Reading', 'Luyện đọc IELTS.', '2026-10-01', 2, 'InProgress'),
(8, 3, 'Writing', 'Luyện viết Task 1 và Task 2.', '2026-11-01', 3, 'InProgress'),
(9, 3, 'Speaking', 'Luyện Speaking Part 1-3.', '2026-12-01', 4, 'NotStarted'),

(10, 4, 'C# Fundamentals', 'Cú pháp và OOP.', '2026-09-01', 1, 'Completed'),
(11, 4, 'ASP.NET Core', 'Web API cơ bản.', '2026-10-01', 2, 'Completed');



/* =========================================================
   8. BOOKINGS
   ========================================================= */


INSERT INTO "Bookings"
(
    "Id",
    "StudentId",
    "TutorSubjectId",
    "StartTimeUtc",
    "EndTimeUtc",
    "CreditCost",
    "Status",
    "StudentNote",
    "MeetingUrl",
    "StatusReason",
    "CancelledByUserId"
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
 'Mình muốn ôn phương trình bậc hai.',
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
 'Ôn tập chương cơ học.',
 'https://meet.google.com/tutorconnect-demo',
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
 'Mình muốn luyện Speaking.',
 NULL,
 'Tutor không có lịch phù hợp vào thời gian này.',
 NULL),

-- Cancelled
(4,
 10,
 6,
 '2026-08-23 12:00:00',
 '2026-08-23 13:00:00',
 100,
 'Cancelled',
 'Học C# OOP.',
 NULL,
 'Sinh viên xin hủy lịch.',
 10),

-- Completed
(5,
 7,
 1,
 '2026-08-10 11:00:00',
 '2026-08-10 12:00:00',
 80,
 'Completed',
 'Ôn phương trình.',
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
 'Luyện IELTS Writing.',
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
 'Confirmed',
 'Luyện ASP.NET Core.',
 'https://meet.google.com/tutorconnect-demo-2',
 NULL,
 NULL);



/* =========================================================
   9. RESCHEDULE REQUESTS
   ========================================================= */


INSERT INTO "RescheduleRequests"
(
    "Id",
    "BookingId",
    "RequestedByUserId",
    "OriginalStartTimeUtc",
    "OriginalEndTimeUtc",
    "ProposedStartTimeUtc",
    "ProposedEndTimeUtc",
    "Reason",
    "Status",
    "RespondedByUserId",
    "ResponseNote",
    "RequestedAtUtc"
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
 'Sinh viên có lịch học đột xuất.',
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
 'Muốn đổi sang ngày hôm sau.',
 'Accepted',
 6,
 'Tutor đồng ý đổi lịch.',
 '2026-08-16 10:00:00'),

-- Rejected
(3,
 5,
 7,
 '2026-08-10 11:00:00',
 '2026-08-10 12:00:00',
 '2026-08-10 13:00:00',
 '2026-08-10 14:00:00',
 'Đề nghị đổi giờ.',
 'Rejected',
 3,
 'Tutor không còn lịch trống.',
 '2026-08-09 10:00:00');



/* =========================================================
   10. SESSION PROGRESS
   ========================================================= */

INSERT INTO "SessionProgress"
(
    "BookingId",
    "LearningGoalId",
    "Score",
    "MaxScore",
    "GoalProgressPercent",
    "TutorComment"
)
VALUES
(
    5,
    1,
    8.5,
    10,
    65.00,
    'Sinh viên đã tiến bộ tốt về phương trình bậc hai.'
),
(
    6,
    3,
    7.0,
    9,
    70.00,
    'Writing đã cải thiện, cần tiếp tục luyện Task 2.'
);


/* =========================================================
   11. REVIEWS
   ========================================================= */


INSERT INTO "Reviews"
(
    "Id",
    "BookingId",
    "ReviewerId",
    "Rating",
    "Comment"
)
VALUES
(
    1,
    5,
    7,
    5,
    'Tutor giảng dễ hiểu và rất nhiệt tình.'
),
(
    2,
    6,
    9,
    4,
    'Buổi học hữu ích, tutor phản hồi khá chi tiết.'
);



/* =========================================================
   12. COMPLAINTS
   ========================================================= */


INSERT INTO "Complaints"
(
    "Id",
    "CreatedByUserId",
    "AgainstUserId",
    "BookingId",
    "Type",
    "Description",
    "EvidenceUrl",
    "Status",
    "AdminResponse",
    "ResolvedByAdminId",
    "SubmittedAtUtc",
    "ResolvedAtUtc"
)
VALUES

-- Open
(
    1,
    7,
    3,
    5,
    'Quality',
    'Tutor cần giải thích chi tiết hơn ở một số phần.',
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
    'Other',
    'Tutor thay đổi lịch học mà chưa thông báo rõ.',
    'https://example.com/evidence/complaint-2.png',
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
    'Quality',
    'Nội dung buổi học không hoàn toàn đúng với mô tả.',
    NULL,
    'Resolved',
    'Admin đã trao đổi với tutor và xác nhận vấn đề đã được xử lý.',
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
    'Other',
    'Khiếu nại không có đủ bằng chứng xác thực.',
    NULL,
    'Rejected',
    'Admin không thể xác nhận nội dung khiếu nại dựa trên thông tin hiện có.',
    2,
    '2026-08-12 15:00:00',
    '2026-08-13 08:00:00'
);



/* =========================================================
   14. PASSWORD RESET TOKENS
   ========================================================= */


INSERT INTO "PasswordResetTokens"
(
    "Id",
    "UserId",
    "TokenHash",
    "ExpiresAtUtc",
    "UsedAtUtc"
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



/* =========================================================
   15. REFRESH TOKENS
   ========================================================= */


INSERT INTO "RefreshTokens"
(
    "Id",
    "UserId",
    "TokenHash",
    "ExpiresAtUtc",
    "RevokedAtUtc"
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



/* =========================================================
   ADD EXTRA TUTORS FOR SEARCH TEST
   ========================================================= */


INSERT INTO "Users"
(
    "Id",
    "Email",
    "PasswordHash",
    "FullName",
    "Phone",
    "Role",
    "Status",
    "TimeZoneId"
)
VALUES
(
    12,
    'thuy.english@tutorconnect.com',
    '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5',
    'Nguyễn Thùy',
    '0902000012',
    'Tutor',
    'Active',
    'Asia/Ho_Chi_Minh'
),
(
    13,
    'linh.english@tutorconnect.com',
    '$2a$11$C6UzMDM.H6dfI/f/IKcEe.1FQxP8xZJv9V9W8K4X8F7Z5X5X5X5',
    'Trần Linh',
    '0902000013',
    'Tutor',
    'Active',
    'Asia/Ho_Chi_Minh'
);

-- Advance identity sequences past the seeded Ids.
SELECT setval(pg_get_serial_sequence('"Users"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "Users"));
SELECT setval(pg_get_serial_sequence('"Subjects"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "Subjects"));
SELECT setval(pg_get_serial_sequence('"TutorSubjects"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "TutorSubjects"));
SELECT setval(pg_get_serial_sequence('"TutorAvailabilities"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "TutorAvailabilities"));
SELECT setval(pg_get_serial_sequence('"LearningGoals"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "LearningGoals"));
SELECT setval(pg_get_serial_sequence('"LearningMilestones"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "LearningMilestones"));
SELECT setval(pg_get_serial_sequence('"Bookings"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "Bookings"));
SELECT setval(pg_get_serial_sequence('"RescheduleRequests"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "RescheduleRequests"));
SELECT setval(pg_get_serial_sequence('"Reviews"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "Reviews"));
SELECT setval(pg_get_serial_sequence('"Complaints"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "Complaints"));
SELECT setval(pg_get_serial_sequence('"PasswordResetTokens"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "PasswordResetTokens"));
SELECT setval(pg_get_serial_sequence('"RefreshTokens"', 'Id'), (SELECT COALESCE(MAX("Id"), 1) FROM "RefreshTokens"));

COMMIT;
