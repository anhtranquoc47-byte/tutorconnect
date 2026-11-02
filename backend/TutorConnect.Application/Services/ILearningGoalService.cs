using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TutorConnect.Application.Features.LearningGoals.DTOs;

namespace TutorConnect.Application.Services
{
    public interface ILearningGoalService
    {
        Task<LearningGoalResponse> CreateGoalAsync(
            LearningGoalCreateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<LearningGoalResponse>> GetMyGoalsAsync(
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<LearningGoalResponse?> GetGoalByIdAsync(
            long goalId,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<LearningGoalResponse> UpdateGoalAsync(
            long goalId,
            LearningGoalUpdateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteGoalAsync(
            long goalId,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<LearningMilestoneResponse> CreateMilestoneAsync(
            long goalId,
            MilestoneCreateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<LearningMilestoneResponse> UpdateMilestoneAsync(
            long goalId,
            long milestoneId,
            MilestoneUpdateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<LearningMilestoneResponse> UpdateMilestoneStatusAsync(
            long goalId,
            long milestoneId,
            MilestoneStatusRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteMilestoneAsync(
            long goalId,
            long milestoneId,
            long currentUserId,
            CancellationToken cancellationToken = default);
    }
}