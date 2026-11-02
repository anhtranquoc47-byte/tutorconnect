using System;
using System.Collections.Generic;
using System.Text;

namespace TutorConnect.Domain.Enums
{
    /// <summary>
    /// Vai trò duy nhất của tài khoản trong phạm vi MVP.
    /// Mỗi tài khoản chỉ có đúng một Role, không đổi được sau khi tạo.
    /// </summary>
    public enum UserRole
    {
        Admin = 1,
        Tutor = 2,
        Student = 3
    }
}
