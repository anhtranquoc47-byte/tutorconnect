using System;
using System.Collections.Generic;
using System.Text;

namespace TutorConnect.Domain.Enums
{
    /// <summary>
    /// Trạng thái tài khoản 
    /// Locked hoặc Inactive không được đăng nhập hoặc thực hiện nghiệp vụ mới.
    /// </summary>
    public enum UserStatus
    {
        Active = 1,
        Locked = 2,
        Inactive = 3
    }
}
