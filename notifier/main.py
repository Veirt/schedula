import os
import schedule
import time
import json
import requests
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
)

if os.environ.get("SCHEDULE_API_URL") is None:
    logging.error("SCHEDULE_API_URL is not set")
    raise Exception("SCHEDULE_API_URL is not set")

if os.environ.get("DISCORD_WEBHOOK_URL") is None:
    logging.error("SCHEDULE_API_URL is not set")
    raise Exception("DISCORD_WEBHOOK_URL is not set")


def notify(course):
    # send over discord webhook
    logging.info(f"Notifying: {course}")
    requests.post(
        os.environ["DISCORD_WEBHOOK_URL"],
        json={"content": f"Reminder: {course} will start in 30 minutes."},
    )


def schedule_every(day_index):
    match day_index:
        case 0:
            return schedule.every().sunday
        case 1:
            return schedule.every().monday
        case 2:
            return schedule.every().tuesday
        case 3:
            return schedule.every().wednesday
        case 4:
            return schedule.every().thursday
        case 5:
            return schedule.every().friday
        case 6:
            return schedule.every().saturday

    raise Exception("Invalid day index")


current_schedule = []


# Resets the schedule. Called when initialising the program and when the schedule has changed.
def reset_schedule():
    schedule.clear("college_schedule")
    for day_index, sch in enumerate(current_schedule):
        for entry in sch:
            # don't notify if it's transition-before/cancellation
            if entry["type"] == "transition-before" or entry["type"] == "cancellation":
                continue
            # subtract 30 minutes from the start time
            initial_datetime = datetime.strptime(entry["start_time"], "%H:%M")
            new_datetime = initial_datetime - timedelta(minutes=30)
            start_time = new_datetime.strftime("%H:%M")

            schedule_every(day_index).at(start_time).do(
                notify, f"{entry['course']}"
            ).tag("college_schedule")


def get_schedule():
    global current_schedule
    # logging.info("Getting schedule...")

    res = requests.get(os.environ["SCHEDULE_API_URL"])

    if os.path.exists("schedule.json"):
        with open("schedule.json", "r") as f:
            if current_schedule == []:
                current_schedule = json.load(f)
                reset_schedule()
                return
            current_schedule = json.load(f)
    else:
        with open("schedule.json", "w") as f:
            json.dump(res.json()["data"], f)
            current_schedule = res.json()["data"]

        return

    if current_schedule != res.json()["data"]:
        logging.info("Schedule(s) have changed.")

        with open("schedule.json", "w") as f:
            json.dump(res.json()["data"], f)
            current_schedule = res.json()["data"]

        reset_schedule()


schedule.every(5).seconds.do(get_schedule).tag("get_schedule")

while True:
    schedule.run_pending()
    time.sleep(1)
