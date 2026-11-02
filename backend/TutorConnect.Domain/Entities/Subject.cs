using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class Subject : BaseEntity
    {
        private Subject()
        {
        }

        public Subject(string code, string name, string? description = null)
        {
            Code = DomainGuard.Required(code, nameof(code), 30);
            Name = DomainGuard.Required(name, nameof(name), 150);
            Description = DomainGuard.Optional(description, nameof(description), 1000);
            IsActive = true;
        }

        public string Code { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public bool IsActive { get; private set; }

        public ICollection<TutorSubject> TutorSubjects { get; private set; } = new List<TutorSubject>();

        public void Update(string code, string name, string? description)
        {
            Code = DomainGuard.Required(code, nameof(code), 30);
            Name = DomainGuard.Required(name, nameof(name), 150);
            Description = DomainGuard.Optional(description, nameof(description), 1000);
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
