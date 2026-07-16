import os
import json
import random
import urllib.request
import urllib.parse
from typing import Optional
from mcp.server.fastmcp import FastMCP
from prisma_client import Prisma

# 1. Initialize the standalone MCP Server
mcp = FastMCP("TripWeaver-Convex-Services")

# 2. Connect to the Supabase Database
db = Prisma()

BASE_URL = "https://standing-fish-574.convex.site"

def _get_json(url: str):
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            data = response.read().decode("utf-8")
            return json.loads(data)
    except Exception as e:
        return {"error": True, "message": str(e), "url": url}

# ==========================================
# FLIGHT SERVICES
# ==========================================

@mcp.tool()
def search_flights(origin: str, destination: str, date: Optional[str] = None) -> str:
    """Searches for real flights by origin and destination."""
    print(f"\n[MCP SERVER] Fetching ALL flights and filtering locally for {origin} to {destination}...")

    url = f"{BASE_URL}/flights"
    data = _get_json(url)

    if isinstance(data, dict) and data.get("error"):
        return f"API Error: {data['message']}"

    flights = data.get("flights", data) if isinstance(data, dict) else data
    if not flights: return "Sorry, no data available."

    # Local fallback filtering
    matched_flights = []
    for f in flights:
        o = f.get("origin", {})
        d = f.get("destination", {})
        
        o_str = f"{o.get('city', '')} {o.get('country', '')} {o.get('airport', '')}".lower()
        d_str = f"{d.get('city', '')} {d.get('country', '')} {d.get('airport', '')}".lower()
        
        if origin.lower() in o_str and destination.lower() in d_str:
            matched_flights.append(f)

    if not matched_flights:
        return f"Sorry, no flights found from {origin} to {destination}."

    result = f"Found flights from {origin} to {destination}:\n"
    for flight in matched_flights[:5]:
        airline = flight.get("airline", "Unknown Airline")
        flight_num = flight.get("flightNumber", f"{airline[:2].upper()}-{random.randint(100,999)}")
        price = flight.get("price", "N/A")
        result += f"- **{airline}** (Flight ID: {flight_num}) - ${price}\n"

    return result

@mcp.tool()
def book_flight(flight_id: str, passenger_name: str) -> str:
    """Saves the final booking permanently to the Supabase database."""
    print(f"\n[MCP SERVER] Saving real booking to Supabase for {passenger_name}...")
    confirmation = "FL-" + "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=6))

    clerk_user_id = os.getenv("CLERK_USER_ID", "user_test_123")

    if not db.is_connected():
        db.connect()

    db.flightbooking.create(
        data={
            "clerkUserId": clerk_user_id,
            "flightId": flight_id,
            "passengerName": passenger_name,
            "confirmationCode": confirmation
        }
    )
    return f"✅ Booking permanently saved to Supabase! Confirmation Code: {confirmation}"


# ==========================================
# HOTEL SERVICES
# ==========================================

@mcp.tool()
def search_hotels(city: str, check_in: Optional[str] = None, check_out: Optional[str] = None) -> str:
    """Searches for real hotels by city."""
    print(f"\n[MCP SERVER] Fetching ALL hotels and filtering locally for {city}...")

    url = f"{BASE_URL}/hotels"
    data = _get_json(url)

    if isinstance(data, dict) and data.get("error"):
        return f"API Error: {data['message']}"

    hotels = data.get("hotels", data) if isinstance(data, dict) else data
    if not hotels: return "Sorry, no data available."

    matched_hotels = []
    for h in hotels:
        # THE FIX: Check the 'city', 'country', AND 'address' fields
        h_city = h.get("city", "")
        h_country = h.get("country", "")
        h_address = h.get("address", "")

        if city.lower() in h_city.lower() or city.lower() in h_address.lower() or city.lower() in h_country.lower():
            matched_hotels.append(h)

    if not matched_hotels:
        return f"Sorry, no hotels found in {city}."

    result = f"Found hotels in {city}:\n"
    for hotel in matched_hotels[:5]:
        name = hotel.get("name", "Unknown Hotel")
        address = hotel.get("address", "Address unavailable")
        result += f"- **{name}** (Location: {address})\n"

    return result
@mcp.tool()
def book_hotel(hotel_name: str, guest_name: str, check_in: str, check_out: str) -> str:
    """Saves the final hotel booking permanently to the Supabase database."""
    print(f"\n[MCP SERVER] Saving real hotel booking to Supabase for {guest_name}...")
    confirmation = "HTL-" + "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=6))

    clerk_user_id = os.getenv("CLERK_USER_ID", "user_test_123")

    if not db.is_connected():
        db.connect()

    db.hotelbooking.create(
        data={
            "clerkUserId": clerk_user_id,
            "hotelName": hotel_name,
            "guestName": guest_name,
            "checkIn": check_in,
            "checkOut": check_out,
            "confirmationCode": confirmation
        }
    )
    return f"✅ Hotel booking permanently saved to Supabase! Confirmation Code: {confirmation}"

if __name__ == "__main__":
    mcp.run()