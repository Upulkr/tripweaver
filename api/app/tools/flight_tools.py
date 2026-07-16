import random
from langchain_core.tools import tool
from prisma_client import Prisma

# Initialize and connect the Prisma client
db = Prisma()
db.connect()

@tool
def search_flights(destination: str) -> str:
    """
    Searches the flight database for available flights and prices to a given destination.
    Use this tool whenever a user asks to find, search for, or check flights.
    """
    print(f"\n[TOOL ACTIVATED] Querying Supabase for flights to: {destination}...")

    # Query the real database
    flights = db.flight.find_many(
        where={
            "destination": {
                "equals": destination,
                "mode": "insensitive"
            }
        }
    )

    if not flights:
        return f"Sorry, we couldn't find any available flights to {destination} at the moment."

    result = f"Found {len(flights)} flights to {destination.title()}:\n"
    for f in flights:
        result += f"- {f.airline} (ID: {f.flightCode}) at {f.departureTime}: ${f.price}\n"
    return result

@tool
def book_flight(flight_id: str, passenger_name: str) -> str:
    """
    Books a flight using the specific flight ID and the passenger's name.
    Use this tool strictly when the user explicitly confirms they want to book a specific flight.
    """
    print(f"\n[TOOL ACTIVATED] Creating Supabase flight booking for {passenger_name} on {flight_id}...")

    # Verify the flight exists in the database
    flight = db.flight.find_first(
        where={
            "flightCode": {
                "equals": flight_id,
                "mode": "insensitive"
            }
        }
    )

    if not flight:
        return f"Error: Could not find a flight with ID {flight_id} in our database."

    # Generate a mock confirmation code
    confirmation_code = "FL-" + "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=6))

    # Insert the official booking record into the database!
    db.flightbooking.create(
        data={
            "flightId": flight.id,
            "passengerName": passenger_name,
            "confirmationCode": confirmation_code
        }
    )

    return (
        f"✅ SUPABASE FLIGHT BOOKING CONFIRMED!\n"
        f"Passenger: {passenger_name}\n"
        f"Flight: {flight.airline} to {flight.destination}\n"
        f"Confirmation Code: {confirmation_code}\n"
    )