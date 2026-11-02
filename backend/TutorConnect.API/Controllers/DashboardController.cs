using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Dashboard.DTOs;
using TutorConnect.Application.Features.Dashboard.Queries.GetAdminDashboard;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/v1/admin/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Dashboard tổng hợp cho Admin
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<DashboardOverviewResponse>> GetAdminDashboard(
            [FromQuery] DateTime? fromUtc,
            [FromQuery] DateTime? toUtc,
            CancellationToken cancellationToken)
        {
            var query = new GetAdminDashboardQuery { FromUtc = fromUtc, ToUtc = toUtc };
            var response = await _mediator.Send(query, cancellationToken);
            return Ok(response);
        }
    }
}
