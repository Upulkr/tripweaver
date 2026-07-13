from prisma import Prisma

def seed_database():
    db = Prisma()
    db.connect()

    # --- Seed Hotels ---
    if db.hotel.count() == 0:
        print("🌱 Seeding hotels...")
        db.hotel.create_many(
            data=[
                {"hotelCode": "PAR-1", "name": "Grand Plaza", "city": "Paris", "price": 150},
                {"hotelCode": "PAR-2", "name": "Sleepy Inn", "city": "Paris", "price": 85},
                {"hotelCode": "TOK-1", "name": "Sakura Hotel", "city": "Tokyo", "price": 120},
                {"hotelCode": "COL-1", "name": "Galle Face Hotel", "city": "Colombo", "price": 180},
                {"hotelCode": "COL-2", "name": "Cinnamon Grand", "city": "Colombo", "price": 160}
            ]
        )
        print("✅ Hotels seeded!")

    # --- Seed Flights ---
    if db.flight.count() == 0:
        print("🌱 Seeding flights...")
        db.flight.create_many(
            data=[
                {"flightCode": "FL-P1", "airline": "Air France", "destination": "Paris", "price": 450, "departureTime": "10:00 AM"},
                {"flightCode": "FL-P2", "airline": "BudgetAir", "destination": "Paris", "price": 200, "departureTime": "06:30 PM"},
                {"flightCode": "FL-T1", "airline": "Japan Airlines", "destination": "Tokyo", "price": 800, "departureTime": "11:00 AM"},
                {"flightCode": "FL-C1", "airline": "SriLankan Airlines", "destination": "Colombo", "price": 300, "departureTime": "02:00 AM"},
                {"flightCode": "FL-C2", "airline": "Emirates", "destination": "Colombo", "price": 450, "departureTime": "08:15 AM"}
            ]
        )
        print("✅ Flights seeded!")

    db.disconnect()

if __name__ == "__main__":
    seed_database()