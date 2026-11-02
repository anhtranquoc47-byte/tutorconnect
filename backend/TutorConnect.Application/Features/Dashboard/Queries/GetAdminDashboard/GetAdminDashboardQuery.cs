using MediatR;
using TutorConnect.Application.Features.Dashboard.DTOs;

namespace TutorConnect.Application.Features.Dashboard.Queries.GetAdminDashboard
{
    /// <summary>
    /// Dashboard tổng hợp cho Admin: thống kê booking + subject phổ biến trong khoảng
    /// thời gian, và các chỉ số hiện tại (tutor chờ duyệt, khiếu nại mở, tỉ lệ hoàn thành mục tiêu).
    /// </summary>
    public class GetAdminDashboardQuery : IRequest<DashboardOverviewResponse>
    {
        /// <summary>
        /// Mặc định 30 ngày gần nhất nếu không truyền.
        /// </summary>
        public DateTime? FromUtc { get; set; }

        public DateTime? ToUtc { get; set; }
    }
}
