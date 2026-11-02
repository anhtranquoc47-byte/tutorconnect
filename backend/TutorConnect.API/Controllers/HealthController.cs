using Microsoft.AspNetCore.Mvc;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "Healthy",
                utcTime = DateTime.UtcNow
            });
        }
    }
}
