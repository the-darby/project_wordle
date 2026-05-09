import random
import json
from datetime import datetime, timezone

FILE_PATH = "word_list.txt"


if __name__ == "__main__":
    with open(FILE_PATH, "r") as file:
        word_bank = file.read().splitlines()

    if word_bank:
        daily_target = random.choice(word_bank).upper()

        output_data = {
            "word": daily_target,
            "date_generated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        }

        with open("daily_word.json", "w") as outfile:
            json.dump(output_data, outfile, indent=4)

        print(f"Successfully wrote {daily_target} to daily_word.json")
    else:
        print("Error: empty word list")
