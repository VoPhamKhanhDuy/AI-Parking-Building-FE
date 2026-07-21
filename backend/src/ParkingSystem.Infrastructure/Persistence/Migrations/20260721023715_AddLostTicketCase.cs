using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkingSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLostTicketCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LostTicketCases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ParkingFee = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Penalty = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    TotalPaid = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    PaidAt = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    PaymentId = table.Column<Guid>(type: "uuid", nullable: true),
                    CaseCode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "now() at time zone 'utc'"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LostTicketCases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LostTicketCases_ParkingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "ParkingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LostTicketCases_ParkingTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "ParkingTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LostTicketCases_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LostTicketCases_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_CaseCode",
                table: "LostTicketCases",
                column: "CaseCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_CreatedAt",
                table: "LostTicketCases",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_PaymentId",
                table: "LostTicketCases",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_PaymentStatus",
                table: "LostTicketCases",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_SessionId",
                table: "LostTicketCases",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_TicketId",
                table: "LostTicketCases",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_LostTicketCases_VehicleId",
                table: "LostTicketCases",
                column: "VehicleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LostTicketCases");
        }
    }
}
