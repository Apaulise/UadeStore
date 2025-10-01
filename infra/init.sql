//(ejecutalo con SSMS o sqlcmd):
IF DB_ID('CampusStore') IS NULL
  CREATE DATABASE CampusStore;
GO
USE CampusStore;
GO

IF OBJECT_ID('dbo.Categories','U') IS NULL
CREATE TABLE Categories (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL
);
GO

IF OBJECT_ID('dbo.Products','U') IS NULL
CREATE TABLE Products (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  CategoryId INT NULL REFERENCES Categories(Id),
  Name NVARCHAR(200) NOT NULL,
  Description NVARCHAR(MAX) NULL,
  Price DECIMAL(10,2) NOT NULL,
  Stock INT NOT NULL DEFAULT 0,
  ImageUrl NVARCHAR(500) NULL
);
GO

IF OBJECT_ID('dbo.Orders','U') IS NULL
CREATE TABLE Orders (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  UserId INT NOT NULL,
  TotalAmount DECIMAL(10,2) NOT NULL,
  Status NVARCHAR(20) NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

IF OBJECT_ID('dbo.OrderItems','U') IS NULL
CREATE TABLE OrderItems (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  OrderId INT NOT NULL REFERENCES Orders(Id),
  ProductId INT NOT NULL REFERENCES Products(Id),
  Quantity INT NOT NULL,
  UnitPrice DECIMAL(10,2) NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM Categories)
INSERT INTO Categories (Name) VALUES ('Indumentaria'), ('Libros'), ('Accesorios');

IF NOT EXISTS (SELECT 1 FROM Products)
INSERT INTO Products(CategoryId, Name, Description, Price, Stock, ImageUrl)
VALUES
(1, 'Buzo UADE', 'Buzo oficial UADE', 19999.00, 15, 'https://picsum.photos/seed/buzo/400/300'),
(1, 'Remera UADE', 'Remera algodón', 9999.00, 30, 'https://picsum.photos/seed/remera/400/300'),
(2, 'Cuaderno UADE', 'Tapa dura', 4999.00, 50, 'https://picsum.photos/seed/cuaderno/400/300'),
(3, 'Mochila UADE', 'Edición Campus', 25999.00, 10, 'https://picsum.photos/seed/mochila/400/300');
