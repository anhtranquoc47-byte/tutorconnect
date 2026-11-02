namespace TutorConnect.Domain.Common
{
    /// <summary>
    /// Base class for domain entities using a BIGINT identity primary key
    /// </summary>
    public abstract class BaseEntity
    {
        /// <summary>
        /// Khóa chính BIGINT IDENTITY. Bằng 0 cho đến khi entity được
        /// SaveChanges lần đầu (EF Core sẽ gán giá trị thật từ database).
        /// </summary>
        public long Id { get; protected set; }
       
    }
}
