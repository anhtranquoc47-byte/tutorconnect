using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Features.LearningGoals.DTOs;
using TutorConnect.Application.Features.Subjects.DTOs;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    public class LearningGoalService : ILearningGoalService
    {
        private readonly ApplicationDbContext _context;

        public LearningGoalService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LearningGoalResponse> CreateGoalAsync(
            LearningGoalCreateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            // Không cho StudentId trong request giả mạo người khác
            if (request.StudentId != currentUserId)
            {
                throw new InvalidOperationException(
                    "Bạn chỉ có thể tạo mục tiêu học tập cho chính mình.");
            }

            var tutorSubjectExists = await _context.TutorSubjects
                .AnyAsync(
                    ts => ts.Id == request.TutorSubjectId,
                    cancellationToken);

            if (!tutorSubjectExists)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy môn học của gia sư.");
            }

            var goal = new LearningGoal(
                currentUserId,
                request.TutorSubjectId,
                request.Title,
                request.Description,
                request.TargetDate);

            _context.LearningGoals.Add(goal);

            await _context.SaveChangesAsync(cancellationToken);

            return await GetGoalOrThrowAsync(
                goal.Id,
                currentUserId,
                cancellationToken);
        }

        public async Task<IReadOnlyList<LearningGoalResponse>> GetMyGoalsAsync(
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var goals = await BuildGoalQuery()
                .Where(g => g.StudentId == currentUserId)
                .OrderByDescending(g => g.Id)
                .ToListAsync(cancellationToken);

            return goals
                .Select(MapGoal)
                .ToList();
        }

        public async Task<LearningGoalResponse?> GetGoalByIdAsync(
            long goalId,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var goal = await BuildGoalQuery()
                .FirstOrDefaultAsync(
                    g => g.Id == goalId &&
                         g.StudentId == currentUserId,
                    cancellationToken);

            return goal == null
                ? null
                : MapGoal(goal);
        }

        public async Task<LearningGoalResponse> UpdateGoalAsync(
            long goalId,
            LearningGoalUpdateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var goal = await _context.LearningGoals
                .FirstOrDefaultAsync(
                    g => g.Id == goalId &&
                         g.StudentId == currentUserId,
                    cancellationToken);

            if (goal == null)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy Learning Goal.");
            }

            goal.Update(
                request.Title,
                request.Description,
                request.TargetDate);

            await _context.SaveChangesAsync(cancellationToken);

            return await GetGoalOrThrowAsync(
                goalId,
                currentUserId,
                cancellationToken);
        }

        public async Task<bool> DeleteGoalAsync(
            long goalId,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var goal = await _context.LearningGoals
                .Include(g => g.LearningMilestones)
                .FirstOrDefaultAsync(
                    g => g.Id == goalId &&
                         g.StudentId == currentUserId,
                    cancellationToken);

            if (goal == null)
            {
                return false;
            }

            // Tự động dọn dẹp các Bài học nhỏ/Cột mốc thuộc Mục tiêu này trước khi xóa
            if (goal.LearningMilestones != null && goal.LearningMilestones.Any())
            {
                _context.LearningMilestones.RemoveRange(goal.LearningMilestones);
            }

            _context.LearningGoals.Remove(goal);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
        public async Task<LearningMilestoneResponse> CreateMilestoneAsync(
            long goalId,
            MilestoneCreateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            await EnsureGoalOwnerAsync(
                goalId,
                currentUserId,
                cancellationToken);

            if (request.OrderNumber <= 0 ||
                request.OrderNumber > short.MaxValue)
            {
                throw new InvalidOperationException(
                    "OrderNumber không hợp lệ.");
            }

            var exists = await _context.LearningMilestones
                .AnyAsync(
                    m => m.LearningGoalId == goalId &&
                         m.OrderNumber == request.OrderNumber,
                    cancellationToken);

            if (exists)
            {
                throw new InvalidOperationException(
                    "OrderNumber này đã tồn tại.");
            }

            var milestone = new LearningMilestone(
                goalId,
                request.Title,
                (short)request.OrderNumber,
                request.Description,
                request.TargetDate);

            _context.LearningMilestones.Add(milestone);

            await _context.SaveChangesAsync(cancellationToken);

            return MapMilestone(milestone);
        }

        public async Task<LearningMilestoneResponse> UpdateMilestoneAsync(
            long goalId,
            long milestoneId,
            MilestoneUpdateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            await EnsureGoalOwnerAsync(
                goalId,
                currentUserId,
                cancellationToken);

            var milestone = await _context.LearningMilestones
                .FirstOrDefaultAsync(
                    m => m.Id == milestoneId &&
                         m.LearningGoalId == goalId,
                    cancellationToken);

            if (milestone == null)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy Milestone.");
            }

            if (request.OrderNumber <= 0 ||
                request.OrderNumber > short.MaxValue)
            {
                throw new InvalidOperationException(
                    "OrderNumber không hợp lệ.");
            }

            var duplicateOrder = await _context.LearningMilestones
                .AnyAsync(
                    m => m.LearningGoalId == goalId &&
                         m.OrderNumber == request.OrderNumber &&
                         m.Id != milestoneId,
                    cancellationToken);

            if (duplicateOrder)
            {
                throw new InvalidOperationException(
                    "OrderNumber này đã tồn tại.");
            }

            milestone.Update(
                request.Title,
                request.Description,
                request.TargetDate);

            milestone.ChangeOrder(
                (short)request.OrderNumber);

            await _context.SaveChangesAsync(cancellationToken);

            return MapMilestone(milestone);
        }

        public async Task<LearningMilestoneResponse>
            UpdateMilestoneStatusAsync(
                long goalId,
                long milestoneId,
                MilestoneStatusRequest request,
                long currentUserId,
                CancellationToken cancellationToken = default)
        {
            var goal = await EnsureGoalOwnerAsync(
                goalId,
                currentUserId,
                cancellationToken);

            var milestone = await _context.LearningMilestones
                .FirstOrDefaultAsync(
                    m => m.Id == milestoneId &&
                         m.LearningGoalId == goalId,
                    cancellationToken);

            if (milestone == null)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy Milestone.");
            }

            milestone.ChangeStatus(request.Status);

            // Nếu tất cả milestone hoàn thành
            // thì cập nhật Learning Goal thành Completed
            var allMilestones = await _context.LearningMilestones
                .Where(m => m.LearningGoalId == goalId)
                .ToListAsync(cancellationToken);

            allMilestones
                .First(m => m.Id == milestoneId)
                .ChangeStatus(request.Status);

            var total = allMilestones.Count;

            var completed = allMilestones.Count(
                m => m.Status == LearningStatus.Completed);

            decimal progress = total == 0
                ? 0
                : (decimal)completed / total * 100;

            goal.SynchronizeStatus(progress);

            await _context.SaveChangesAsync(cancellationToken);

            return MapMilestone(milestone);
        }

        public async Task<bool> DeleteMilestoneAsync(
            long goalId,
            long milestoneId,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            await EnsureGoalOwnerAsync(
                goalId,
                currentUserId,
                cancellationToken);

            var milestone = await _context.LearningMilestones
                .FirstOrDefaultAsync(
                    m => m.Id == milestoneId &&
                         m.LearningGoalId == goalId,
                    cancellationToken);

            if (milestone == null)
            {
                return false;
            }

            _context.LearningMilestones.Remove(milestone);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        private IQueryable<LearningGoal> BuildGoalQuery()
        {
            return _context.LearningGoals
                .Include(g => g.Student)
                .Include(g => g.TutorSubject)
                    .ThenInclude(ts => ts.Subject)
                .Include(g => g.TutorSubject)
                    .ThenInclude(ts => ts.Tutor)
                        .ThenInclude(t => t.User)
                .Include(g => g.LearningMilestones)
                .Include(g => g.SessionProgresses)
                .AsNoTracking();
        }

        private async Task<LearningGoal> EnsureGoalOwnerAsync(
            long goalId,
            long currentUserId,
            CancellationToken cancellationToken)
        {
            var goal = await _context.LearningGoals
                .FirstOrDefaultAsync(
                    g => g.Id == goalId &&
                         g.StudentId == currentUserId,
                    cancellationToken);

            if (goal == null)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy Learning Goal hoặc bạn không có quyền.");
            }

            return goal;
        }

        private async Task<LearningGoalResponse> GetGoalOrThrowAsync(
            long goalId,
            long currentUserId,
            CancellationToken cancellationToken)
        {
            var goal = await BuildGoalQuery()
                .FirstOrDefaultAsync(
                    g => g.Id == goalId &&
                         g.StudentId == currentUserId,
                    cancellationToken);

            if (goal == null)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy Learning Goal.");
            }

            return MapGoal(goal);
        }

        private static LearningGoalResponse MapGoal(
            LearningGoal goal)
        {
            var tutorUser = goal.TutorSubject.Tutor.User;

            double? currentProgress = goal.SessionProgresses
                .OrderByDescending(p => p.BookingId)
                .Select(p => (double?)p.GoalProgressPercent)
                .FirstOrDefault();

            return new LearningGoalResponse(
                goal.Id,

                new UserLiteResponse(
                    goal.Student.Id,
                    goal.Student.FullName,
                    goal.Student.Role),

                goal.TutorSubjectId,

                new UserLiteResponse(
                    tutorUser.Id,
                    tutorUser.FullName,
                    tutorUser.Role),

                new SubjectResponse(
                    goal.TutorSubject.Subject.Id,
                    goal.TutorSubject.Subject.Code,
                    goal.TutorSubject.Subject.Name,
                    goal.TutorSubject.Subject.Description,
                    goal.TutorSubject.Subject.IsActive),

                goal.Title,
                goal.Description,
                goal.TargetDate,
                goal.Status,
                currentProgress,

                goal.LearningMilestones
                    .OrderBy(m => m.OrderNumber)
                    .Select(MapMilestone)
                    .ToList());
        }

        private static LearningMilestoneResponse MapMilestone(
            LearningMilestone milestone)
        {
            return new LearningMilestoneResponse(
                milestone.Id,
                milestone.LearningGoalId,
                milestone.Title,
                milestone.Description,
                milestone.TargetDate,
                milestone.OrderNumber,
                milestone.Status);
        }
    }
}