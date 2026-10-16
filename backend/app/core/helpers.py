from datetime import datetime, timezone, timedelta

def get_tentative_delivery_date(days_offset: int = 4) -> str:
    """Returns formatted tentative delivery date, e.g. 'Delivery by Mon, 21 Jul' or 'Mon, 21 Jul'"""
    target_date = datetime.now(timezone.utc) + timedelta(days=days_offset)
    # Format e.g., "Mon, 21 Jul"
    day_name = target_date.strftime("%a")
    day_num = target_date.strftime("%d").lstrip("0")
    month_name = target_date.strftime("%b")
    return f"{day_name}, {day_num} {month_name}"
