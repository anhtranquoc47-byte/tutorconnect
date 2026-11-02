namespace TutorConnect.Application.Common.Exceptions
{
    /// <summary>
    /// Represents a requested resource that does not exist.
    /// </summary>
    public sealed class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message)
        {
        }
    }
}
