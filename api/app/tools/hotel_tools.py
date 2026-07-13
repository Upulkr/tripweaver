import random
from langchain_core.tools import tool
from prisma import Prisma

# Initialize and connect the Prisma client
db = Prisma()
db.connect()

@tool
def search_hotels(city: str) -> str:
    """
    Searches the hotel database for available accommodations and prices in a given city.
    Use this tool whenever a user asks to find, book, or search for hotels.
    """
    print(f"\n[TOOL ACTIVATED] Querying Supabase for hotels in: {city}...")

    # Query the real database (case-insensitive search!)
    hotels = db.hotel.find_many(
        where={
            "city": {
                "equals": city,
                "mode": "insensitive"
            }
        }
    )

    if not hotels:
        return f"Sorry, we couldn't find any available hotels in {city} at the moment."

    result = f"Found {len(hotels)} hotels in {city.title()}:\n"
    for h in hotels:
        result += f"- {h.name} (ID: {h.hotelCode}): ${h.price}/night\n"
    return result

@tool
def book_hotel(hotel_name: str, nights: int, guest_name: str) -> str:
    """
    Books a hotel room for a specified number of nights and guest name.
    Use this tool strictly when the user explicitly confirms they want to book or reserve a specific hotel.
    """
    print(f"\n[TOOL ACTIVATED] Creating Supabase booking for {guest_name} at {hotel_name}...")

    # Find the specific hotel in the database
    hotel = db.hotel.find_first(
        where={
            "name": {
                "equals": hotel_name,
                "mode": "insensitive"
            }
        }
    )

    if not hotel:
        return f"Error: Could not find a hotel named {hotel_name} in our database."

    # Generate a mock confirmation code
    confirmation_code = "TW-" + "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=6))

    # Insert the official booking record into the database!
    db.hotelbooking.create(
        data={
            "hotelId": hotel.id,
            "guestName": guest_name,
            "nights": nights,
            "confirmationCode": confirmation_code
        }
    )

    return (
        f"✅ SUPABASE BOOKING CONFIRMED!\n"
        f"Hotel: {hotel.name}\n"
        f"Guest: {guest_name}\n"
        f"Duration: {nights} night(s)\n"
        f"Confirmation Code: {confirmation_code}\n"
    )