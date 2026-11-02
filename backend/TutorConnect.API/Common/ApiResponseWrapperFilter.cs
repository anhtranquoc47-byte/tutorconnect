using System.Net;
using TutorConnect.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TutorConnect.API.Common
{
    /// <summary>
    /// Wraps controller results in a consistent ApiResponse envelope.
    /// </summary>
    public sealed class ApiResponseWrapperFilter : IAsyncResultFilter
    {
        public async Task OnResultExecutionAsync(
            ResultExecutingContext context,
            ResultExecutionDelegate next)
        {
            switch (context.Result)
            {
                case ObjectResult objectResult when IsApiResponse(objectResult.Value):
                    break;

                case ObjectResult objectResult:
                    objectResult.Value = Build(
                        objectResult.Value,
                        objectResult.StatusCode ?? StatusCodes.Status200OK);
                    break;

                case StatusCodeResult statusCodeResult:
                    context.Result = new ObjectResult(
                        Build(null, statusCodeResult.StatusCode))
                    {
                        StatusCode = statusCodeResult.StatusCode
                    };
                    break;

                case EmptyResult:
                    context.Result = new ObjectResult(
                        Build(null, StatusCodes.Status200OK))
                    {
                        StatusCode = StatusCodes.Status200OK
                    };
                    break;
            }

            await next();
        }

        private static ApiResponse<object?> Build(object? value, int statusCode)
        {
            var isSuccess = statusCode is >= 200 and < 300;

            return new ApiResponse<object?>
            {
                Message = isSuccess
                    ? DefaultMessage(statusCode)
                    : ExtractMessage(value, statusCode),
                Data = isSuccess ? value : null,
                Code = statusCode
            };
        }

        private static bool IsApiResponse(object? value)
        {
            if (value is null)
            {
                return false;
            }

            var type = value.GetType();
            return type.IsGenericType &&
                   type.GetGenericTypeDefinition() == typeof(ApiResponse<>);
        }

        private static string ExtractMessage(object? value, int statusCode)
        {
            return value switch
            {
                ValidationProblemDetails validationProblem =>
                    string.Join("; ", validationProblem.Errors.SelectMany(entry => entry.Value)),
                ProblemDetails problem =>
                    problem.Detail ?? problem.Title ?? DefaultMessage(statusCode),
                string message => message,
                null => DefaultMessage(statusCode),
                _ => value.ToString() ?? DefaultMessage(statusCode)
            };
        }

        private static string DefaultMessage(int statusCode) =>
            ((HttpStatusCode)statusCode).ToString();
    }
}
