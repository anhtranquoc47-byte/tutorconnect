using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TutorConnect.Infrastructure.SqlServer.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenHashAndEmailVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Token",
                table: "PasswordResetTokens");

            migrationBuilder.DropColumn(
                name: "Token",
                table: "EmailVerificationTokens");

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerifiedAtUtc",
                table: "Users",
                type: "datetime2(0)",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UsedAtUtc",
                table: "PasswordResetTokens",
                type: "datetime2(0)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpiresAtUtc",
                table: "PasswordResetTokens",
                type: "datetime2(0)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "TokenHash",
                table: "PasswordResetTokens",
                type: "char(64)",
                fixedLength: true,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "VerifiedAtUtc",
                table: "EmailVerificationTokens",
                type: "datetime2(0)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpiresAtUtc",
                table: "EmailVerificationTokens",
                type: "datetime2(0)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "TokenHash",
                table: "EmailVerificationTokens",
                type: "char(64)",
                fixedLength: true,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_TokenHash",
                table: "PasswordResetTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationTokens_TokenHash",
                table: "EmailVerificationTokens",
                column: "TokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_TokenHash",
                table: "PasswordResetTokens");

            migrationBuilder.DropIndex(
                name: "IX_EmailVerificationTokens_TokenHash",
                table: "EmailVerificationTokens");

            migrationBuilder.DropColumn(
                name: "EmailVerifiedAtUtc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TokenHash",
                table: "PasswordResetTokens");

            migrationBuilder.DropColumn(
                name: "TokenHash",
                table: "EmailVerificationTokens");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UsedAtUtc",
                table: "PasswordResetTokens",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(0)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpiresAtUtc",
                table: "PasswordResetTokens",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(0)");

            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "PasswordResetTokens",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "VerifiedAtUtc",
                table: "EmailVerificationTokens",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(0)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ExpiresAtUtc",
                table: "EmailVerificationTokens",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(0)");

            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "EmailVerificationTokens",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
