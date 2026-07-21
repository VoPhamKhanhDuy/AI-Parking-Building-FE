namespace ParkingSystem.Domain.Enums;

public enum NotificationType
{
    System = 0,
    Payment = 1,
    Reservation = 2,
    Entry = 3,
    Exit = 4,
    LostTicket = 5,
    Alert = 6
}

public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

public enum NotificationStatus
{
    Unread = 0,
    Read = 1,
    Dismissed = 2
}
