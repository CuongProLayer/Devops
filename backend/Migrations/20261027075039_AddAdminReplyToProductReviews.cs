using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStock.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminReplyToProductReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "ProductReviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RepliedAt",
                table: "ProductReviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$5Q/V4SrRu4W4HkRCcVjzqOSlM8eFDTPn6tqoWZGfpWpvoQrRfuyVi");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$Izv7nAljH4fYkaWcjmizRuH4a9RypXNvCEnbRe5Rvk007PV.7Bg9G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$KDm2Kp33YZyb17csKok2we0v/MXffgAa.hXEATeLTWNnX8Bgot5M6");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "ProductReviews");

            migrationBuilder.DropColumn(
                name: "RepliedAt",
                table: "ProductReviews");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$AZ3yy4QMKChWNuqVMla1bObFZu1uivXKwb3DH2o3YNYfMhoezZKYa");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$dgdh5FT7L.vuJg4aF.kN4e1N3VX1AqVb80LwQQ2AnMg4XrWt9Fv8.");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$NgkLu8aLGhR85Hx8dtzRp.DnTIy6atNsyuPygZCOjjKRk92QS8/hy");
        }
    }
}
