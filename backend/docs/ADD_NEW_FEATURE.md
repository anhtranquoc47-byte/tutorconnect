# Thêm feature mới

Ví dụ cần tạo feature `Products`:

```text
TutorConnect.Domain/
├── Entities/Product.cs
└── Interfaces/IProductRepository.cs

TutorConnect.Application/
├── Features/Products/Commands/CreateProduct/
├── Features/Products/Queries/GetProducts/
└── Mappings/ProductMappingRegister.cs

TutorConnect.Infrastructure.SqlServer/
├── Models/ProductDataModel.cs
├── Configurations/ProductConfiguration.cs
└── Repositories/ProductRepository.cs

TutorConnect.API/
├── Controllers/ProductsController.cs
└── Models/Products/
```

Luồng phụ thuộc:

```text
API -> Application -> Domain
API -> Infrastructure.SqlServer -> Domain
```

Domain không được tham chiếu Application, Infrastructure hoặc API.
Application không được tham chiếu Infrastructure hoặc API.
