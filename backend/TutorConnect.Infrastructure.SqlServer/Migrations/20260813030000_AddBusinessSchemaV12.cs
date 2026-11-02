using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TutorConnect.Infrastructure.SqlServer.Migrations
{
    public partial class AddBusinessSchemaV12 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.Id);
                    table.CheckConstraint("CK_Subjects_Code_NotBlank", "NULLIF(LTRIM(RTRIM([Code])), '') IS NOT NULL");
                    table.CheckConstraint("CK_Subjects_Name_NotBlank", "NULLIF(LTRIM(RTRIM([Name])), '') IS NOT NULL");
                });

            migrationBuilder.CreateTable(
                name: "TutorProfiles",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: true),
                    Qualification = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExperienceYears = table.Column<short>(type: "smallint", nullable: false),
                    VerificationDocumentUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ReviewNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: true),
                    ReviewedByAdminId = table.Column<long>(type: "bigint", nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorProfiles", x => x.UserId);
                    table.CheckConstraint("CK_TutorProfiles_ApprovalStatus", "[ApprovalStatus] IN ('Draft', 'Pending', 'Approved', 'Rejected', 'Suspended')");
                    table.CheckConstraint("CK_TutorProfiles_ApprovalFields", "([ApprovalStatus] = 'Draft' AND [SubmittedAtUtc] IS NULL AND [ReviewedByAdminId] IS NULL AND [ReviewedAtUtc] IS NULL) OR ([ApprovalStatus] = 'Pending' AND [SubmittedAtUtc] IS NOT NULL AND [ReviewedByAdminId] IS NULL AND [ReviewedAtUtc] IS NULL) OR ([ApprovalStatus] = 'Approved' AND [SubmittedAtUtc] IS NOT NULL AND [ReviewedByAdminId] IS NOT NULL AND [ReviewedAtUtc] IS NOT NULL) OR ([ApprovalStatus] IN ('Rejected', 'Suspended') AND [SubmittedAtUtc] IS NOT NULL AND [ReviewedByAdminId] IS NOT NULL AND [ReviewedAtUtc] IS NOT NULL AND NULLIF(LTRIM(RTRIM([ReviewNote])), '') IS NOT NULL)");
                    table.CheckConstraint("CK_TutorProfiles_ExperienceYears", "[ExperienceYears] BETWEEN 0 AND 80");
                    table.CheckConstraint("CK_TutorProfiles_ReviewChronology", "[ReviewedAtUtc] IS NULL OR ([SubmittedAtUtc] IS NOT NULL AND [ReviewedAtUtc] >= [SubmittedAtUtc])");
                    table.ForeignKey(
                        name: "FK_TutorProfiles_Users_ReviewedByAdminId",
                        column: x => x.ReviewedByAdminId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TutorProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TutorSubjects",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<long>(type: "bigint", nullable: false),
                    TeachingLevel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FeePerSessionCredits = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorSubjects", x => x.Id);
                    table.CheckConstraint("CK_TutorSubjects_Fee", "[FeePerSessionCredits] > 0");
                    table.CheckConstraint("CK_TutorSubjects_TeachingLevel_NotBlank", "NULLIF(LTRIM(RTRIM([TeachingLevel])), '') IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_TutorSubjects_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TutorSubjects_TutorProfiles_TutorId",
                        column: x => x.TutorId,
                        principalTable: "TutorProfiles",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "TutorAvailabilities",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time(0)", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time(0)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorAvailabilities", x => x.Id);
                    table.CheckConstraint("CK_TutorAvailabilities_DayOfWeek", "[DayOfWeek] BETWEEN 0 AND 6");
                    table.CheckConstraint("CK_TutorAvailabilities_Time", "[EndTime] > [StartTime]");
                    table.ForeignKey(
                        name: "FK_TutorAvailabilities_TutorProfiles_TutorId",
                        column: x => x.TutorId,
                        principalTable: "TutorProfiles",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TutorSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    StartTimeUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    EndTimeUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    CreditCost = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    StudentNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MeetingUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StatusReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CancelledByUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.CheckConstraint("CK_Bookings_CreditCost", "[CreditCost] > 0");
                    table.CheckConstraint("CK_Bookings_Status", "[Status] IN ('Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed')");
                    table.CheckConstraint("CK_Bookings_StatusFields", "([Status] = 'Cancelled' AND [CancelledByUserId] IS NOT NULL AND NULLIF(LTRIM(RTRIM([StatusReason])), '') IS NOT NULL) OR ([Status] = 'Rejected' AND [CancelledByUserId] IS NULL AND NULLIF(LTRIM(RTRIM([StatusReason])), '') IS NOT NULL) OR ([Status] IN ('Pending', 'Confirmed', 'Completed') AND [CancelledByUserId] IS NULL AND [StatusReason] IS NULL)");
                    table.CheckConstraint("CK_Bookings_Time", "[EndTimeUtc] > [StartTimeUtc]");
                    table.ForeignKey(
                        name: "FK_Bookings_TutorSubjects_TutorSubjectId",
                        column: x => x.TutorSubjectId,
                        principalTable: "TutorSubjects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bookings_Users_CancelledByUserId",
                        column: x => x.CancelledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bookings_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LearningGoals",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TutorSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: true),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningGoals", x => x.Id);
                    table.CheckConstraint("CK_LearningGoals_Status", "[Status] IN ('NotStarted', 'InProgress', 'Completed', 'Cancelled')");
                    table.CheckConstraint("CK_LearningGoals_Title_NotBlank", "NULLIF(LTRIM(RTRIM([Title])), '') IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_LearningGoals_TutorSubjects_TutorSubjectId",
                        column: x => x.TutorSubjectId,
                        principalTable: "TutorSubjects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LearningGoals_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Complaints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    AgainstUserId = table.Column<long>(type: "bigint", nullable: false),
                    BookingId = table.Column<long>(type: "bigint", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    EvidenceUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AdminResponse = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ResolvedByAdminId = table.Column<long>(type: "bigint", nullable: true),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    ResolvedAtUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Complaints", x => x.Id);
                    table.CheckConstraint("CK_Complaints_Description_NotBlank", "NULLIF(LTRIM(RTRIM([Description])), '') IS NOT NULL");
                    table.CheckConstraint("CK_Complaints_DifferentUsers", "[CreatedByUserId] <> [AgainstUserId]");
                    table.CheckConstraint("CK_Complaints_ResolutionChronology", "[ResolvedAtUtc] IS NULL OR [ResolvedAtUtc] >= [SubmittedAtUtc]");
                    table.CheckConstraint("CK_Complaints_ResolutionFields", "([Status] IN ('Open', 'InReview') AND [AdminResponse] IS NULL AND [ResolvedByAdminId] IS NULL AND [ResolvedAtUtc] IS NULL) OR ([Status] IN ('Resolved', 'Rejected') AND NULLIF(LTRIM(RTRIM([AdminResponse])), '') IS NOT NULL AND [ResolvedByAdminId] IS NOT NULL AND [ResolvedAtUtc] IS NOT NULL)");
                    table.CheckConstraint("CK_Complaints_Status", "[Status] IN ('Open', 'InReview', 'Resolved', 'Rejected')");
                    table.CheckConstraint("CK_Complaints_Type_NotBlank", "NULLIF(LTRIM(RTRIM([Type])), '') IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_Complaints_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Complaints_Users_AgainstUserId",
                        column: x => x.AgainstUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Complaints_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Complaints_Users_ResolvedByAdminId",
                        column: x => x.ResolvedByAdminId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LearningMilestones",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LearningGoalId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: true),
                    OrderNumber = table.Column<short>(type: "smallint", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningMilestones", x => x.Id);
                    table.CheckConstraint("CK_LearningMilestones_OrderNumber", "[OrderNumber] > 0");
                    table.CheckConstraint("CK_LearningMilestones_Status", "[Status] IN ('NotStarted', 'InProgress', 'Completed', 'Cancelled')");
                    table.CheckConstraint("CK_LearningMilestones_Title_NotBlank", "NULLIF(LTRIM(RTRIM([Title])), '') IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_LearningMilestones_LearningGoals_LearningGoalId",
                        column: x => x.LearningGoalId,
                        principalTable: "LearningGoals",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RescheduleRequests",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<long>(type: "bigint", nullable: false),
                    RequestedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    OriginalStartTimeUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    OriginalEndTimeUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    ProposedStartTimeUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    ProposedEndTimeUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RespondedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    ResponseNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequestedAtUtc = table.Column<DateTime>(type: "datetime2(0)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RescheduleRequests", x => x.Id);
                    table.CheckConstraint("CK_RescheduleRequests_DifferentUsers", "[RespondedByUserId] IS NULL OR [RespondedByUserId] <> [RequestedByUserId]");
                    table.CheckConstraint("CK_RescheduleRequests_OriginalTime", "[OriginalEndTimeUtc] > [OriginalStartTimeUtc]");
                    table.CheckConstraint("CK_RescheduleRequests_ProposedTime", "[ProposedEndTimeUtc] > [ProposedStartTimeUtc]");
                    table.CheckConstraint("CK_RescheduleRequests_Status", "[Status] IN ('Pending', 'Accepted', 'Rejected', 'Cancelled')");
                    table.CheckConstraint("CK_RescheduleRequests_StatusFields", "([Status] = 'Pending' AND [RespondedByUserId] IS NULL AND [ResponseNote] IS NULL) OR ([Status] IN ('Accepted', 'Rejected') AND [RespondedByUserId] IS NOT NULL) OR ([Status] = 'Cancelled' AND [RespondedByUserId] IS NULL AND [ResponseNote] IS NULL)");
                    table.ForeignKey(
                        name: "FK_RescheduleRequests_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RescheduleRequests_Users_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RescheduleRequests_Users_RespondedByUserId",
                        column: x => x.RespondedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<long>(type: "bigint", nullable: false),
                    ReviewerId = table.Column<long>(type: "bigint", nullable: false),
                    Rating = table.Column<byte>(type: "tinyint", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.CheckConstraint("CK_Reviews_Rating", "[Rating] BETWEEN 1 AND 5");
                    table.ForeignKey(
                        name: "FK_Reviews_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Reviews_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SessionProgress",
                columns: table => new
                {
                    BookingId = table.Column<long>(type: "bigint", nullable: false),
                    LearningGoalId = table.Column<long>(type: "bigint", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: true),
                    MaxScore = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: true),
                    GoalProgressPercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TutorComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionProgress", x => x.BookingId);
                    table.CheckConstraint("CK_SessionProgress_GoalProgress", "[GoalProgressPercent] BETWEEN 0 AND 100");
                    table.CheckConstraint("CK_SessionProgress_Score", "([Score] IS NULL AND [MaxScore] IS NULL) OR ([Score] IS NOT NULL AND [MaxScore] IS NOT NULL AND [MaxScore] > 0 AND [Score] >= 0 AND [Score] <= [MaxScore])");
                    table.CheckConstraint("CK_SessionProgress_TutorComment_NotBlank", "NULLIF(LTRIM(RTRIM([TutorComment])), '') IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_SessionProgress_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SessionProgress_LearningGoals_LearningGoalId",
                        column: x => x.LearningGoalId,
                        principalTable: "LearningGoals",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(name: "IX_Subjects_Code", table: "Subjects", column: "Code", unique: true);
            migrationBuilder.CreateIndex(name: "IX_Subjects_Name", table: "Subjects", column: "Name", unique: true);
            migrationBuilder.CreateIndex(name: "IX_Subjects_IsActive_Name", table: "Subjects", columns: new[] { "IsActive", "Name" });

            migrationBuilder.CreateIndex(name: "IX_TutorProfiles_ApprovalStatus", table: "TutorProfiles", column: "ApprovalStatus");
            migrationBuilder.CreateIndex(name: "IX_TutorProfiles_ReviewedByAdminId", table: "TutorProfiles", column: "ReviewedByAdminId", filter: "[ReviewedByAdminId] IS NOT NULL");

            migrationBuilder.CreateIndex(name: "IX_TutorSubjects_SubjectId_TeachingLevel_IsActive_FeePerSessionCredits", table: "TutorSubjects", columns: new[] { "SubjectId", "TeachingLevel", "IsActive", "FeePerSessionCredits" });
            migrationBuilder.CreateIndex(name: "IX_TutorSubjects_TutorId_IsActive", table: "TutorSubjects", columns: new[] { "TutorId", "IsActive" });
            migrationBuilder.CreateIndex(name: "IX_TutorSubjects_TutorId_SubjectId_TeachingLevel", table: "TutorSubjects", columns: new[] { "TutorId", "SubjectId", "TeachingLevel" }, unique: true);

            migrationBuilder.CreateIndex(name: "IX_TutorAvailabilities_TutorId_DayOfWeek_StartTime_EndTime", table: "TutorAvailabilities", columns: new[] { "TutorId", "DayOfWeek", "StartTime", "EndTime" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_TutorAvailabilities_TutorId_IsActive_DayOfWeek", table: "TutorAvailabilities", columns: new[] { "TutorId", "IsActive", "DayOfWeek" });

            migrationBuilder.CreateIndex(name: "IX_Bookings_CancelledByUserId", table: "Bookings", column: "CancelledByUserId", filter: "[CancelledByUserId] IS NOT NULL");
            migrationBuilder.CreateIndex(name: "IX_Bookings_Status_StartTimeUtc", table: "Bookings", columns: new[] { "Status", "StartTimeUtc" });
            migrationBuilder.CreateIndex(name: "IX_Bookings_StudentId_Status_StartTimeUtc_EndTimeUtc", table: "Bookings", columns: new[] { "StudentId", "Status", "StartTimeUtc", "EndTimeUtc" });
            migrationBuilder.CreateIndex(name: "IX_Bookings_TutorSubjectId_Status_StartTimeUtc_EndTimeUtc", table: "Bookings", columns: new[] { "TutorSubjectId", "Status", "StartTimeUtc", "EndTimeUtc" });

            migrationBuilder.CreateIndex(name: "IX_LearningGoals_StudentId_Status", table: "LearningGoals", columns: new[] { "StudentId", "Status" });
            migrationBuilder.CreateIndex(name: "IX_LearningGoals_TutorSubjectId_Status", table: "LearningGoals", columns: new[] { "TutorSubjectId", "Status" });

            migrationBuilder.CreateIndex(name: "IX_LearningMilestones_LearningGoalId_OrderNumber", table: "LearningMilestones", columns: new[] { "LearningGoalId", "OrderNumber" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_LearningMilestones_LearningGoalId_Status", table: "LearningMilestones", columns: new[] { "LearningGoalId", "Status" });

            migrationBuilder.CreateIndex(name: "IX_RescheduleRequests_BookingId", table: "RescheduleRequests", column: "BookingId", unique: true, filter: "[Status] = 'Pending'");
            migrationBuilder.CreateIndex(name: "IX_RescheduleRequests_BookingId_Status_RequestedAtUtc", table: "RescheduleRequests", columns: new[] { "BookingId", "Status", "RequestedAtUtc" });
            migrationBuilder.CreateIndex(name: "IX_RescheduleRequests_RequestedByUserId_RequestedAtUtc", table: "RescheduleRequests", columns: new[] { "RequestedByUserId", "RequestedAtUtc" });
            migrationBuilder.CreateIndex(name: "IX_RescheduleRequests_RespondedByUserId", table: "RescheduleRequests", column: "RespondedByUserId", filter: "[RespondedByUserId] IS NOT NULL");

            migrationBuilder.CreateIndex(name: "IX_Reviews_BookingId_ReviewerId", table: "Reviews", columns: new[] { "BookingId", "ReviewerId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_Reviews_ReviewerId_BookingId", table: "Reviews", columns: new[] { "ReviewerId", "BookingId" });

            migrationBuilder.CreateIndex(name: "IX_SessionProgress_LearningGoalId_BookingId", table: "SessionProgress", columns: new[] { "LearningGoalId", "BookingId" });

            migrationBuilder.CreateIndex(name: "IX_Complaints_AgainstUserId_SubmittedAtUtc", table: "Complaints", columns: new[] { "AgainstUserId", "SubmittedAtUtc" });
            migrationBuilder.CreateIndex(name: "IX_Complaints_BookingId", table: "Complaints", column: "BookingId", filter: "[BookingId] IS NOT NULL");
            migrationBuilder.CreateIndex(name: "IX_Complaints_CreatedByUserId_SubmittedAtUtc", table: "Complaints", columns: new[] { "CreatedByUserId", "SubmittedAtUtc" });
            migrationBuilder.CreateIndex(name: "IX_Complaints_ResolvedByAdminId", table: "Complaints", column: "ResolvedByAdminId", filter: "[ResolvedByAdminId] IS NOT NULL");
            migrationBuilder.CreateIndex(name: "IX_Complaints_Status_SubmittedAtUtc", table: "Complaints", columns: new[] { "Status", "SubmittedAtUtc" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Complaints");
            migrationBuilder.DropTable(name: "LearningMilestones");
            migrationBuilder.DropTable(name: "RescheduleRequests");
            migrationBuilder.DropTable(name: "Reviews");
            migrationBuilder.DropTable(name: "SessionProgress");
            migrationBuilder.DropTable(name: "TutorAvailabilities");
            migrationBuilder.DropTable(name: "Bookings");
            migrationBuilder.DropTable(name: "LearningGoals");
            migrationBuilder.DropTable(name: "TutorSubjects");
            migrationBuilder.DropTable(name: "Subjects");
            migrationBuilder.DropTable(name: "TutorProfiles");
        }
    }
}
