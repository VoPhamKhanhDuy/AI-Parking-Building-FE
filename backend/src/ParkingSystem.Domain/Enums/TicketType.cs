namespace ParkingSystem.Domain.Enums;

/// <summary>
/// How a ticket was issued / what pricing scheme applies.
/// </summary>
public enum TicketType
{
    /// <summary>Walk-in / hourly customer.</summary>
    Hourly = 0,

    /// <summary>Daily pass.</summary>
    Daily = 1,

    /// <summary>Recurring monthly subscriber.</summary>
    MonthlyPass = 2,

    /// <summary>Pre-booked reservation slot.</summary>
    Reservation = 3,

    /// <summary>Complimentary / staff ticket.</summary>
    Complimentary = 4
}