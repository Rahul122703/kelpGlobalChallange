import csv
import random
from faker import Faker
import os

# Initialize Faker with Indian locale
fake = Faker("en_IN")

# Total records
TOTAL_ROWS = 60000

# Get the current folder where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(current_dir, "users.csv")

# Define CSV headers
headers = [
    "name.firstName",
    "name.lastName",
    "age",
    "address.line1",
    "address.line2",
    "address.city",
    "address.state",
    "gender",
]

genders = ["male", "female"]

# Create CSV file in the same folder
with open(OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(headers)

    for _ in range(TOTAL_ROWS):
        first_name = fake.first_name()
        last_name = fake.last_name()
        age = random.randint(10, 80)

        # Split and clean address lines
        address = fake.street_address().split(",", 1)
        line1 = address[0].replace("\n", " ").strip()
        line2 = address[1].replace("\n", " ").strip() if len(address) > 1 else ""

        city = fake.city()
        state = fake.state()
        gender = random.choice(genders)

        writer.writerow([first_name, last_name, age, line1, line2, city, state, gender])

print(f"✅ Generated {TOTAL_ROWS} clean records in {OUTPUT_FILE}")
