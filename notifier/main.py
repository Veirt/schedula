import os
import schedule
import time
import json
import requests
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from utils import schedule_every

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
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


SCHEDULE_FILE = "schedule.json"


class ScheduleManager:
    def __init__(self):
        logging.info("Initializing schedule")
        self.current_schedule = {}

    # Resets the schedule. Called when initialising the program and when the schedule has changed.
    def reset_schedule(self):
        schedule.clear("college_schedule")
        for day_index, sch in self.current_schedule.items():
            for entry in sch:
                if "type" in entry and (
                    entry["type"] == "transition-before"
                    or entry["type"] == "cancellation"
                ):
                    continue
                # subtract 30 minutes from the start time
                initial_datetime = datetime.strptime(entry["startTime"], "%H:%M")
                new_datetime = initial_datetime - timedelta(minutes=30)
                start_time = new_datetime.strftime("%H:%M")

                schedule_every(int(day_index)).at(start_time).do(
                    notify, f"{entry['course']}"
                ).tag("college_schedule")

    def get_schedule(self):
        try:
            res = requests.get(os.environ["SCHEDULE_API_URL"])
            res.raise_for_status()
            new_schedule_data = res.json()["data"]
        except Exception as e:
            logging.error(f"Cannot access Schedule API. Error: {e}")
            return

        existing_schedule_data = {}
        if os.path.exists(SCHEDULE_FILE):
            with open(SCHEDULE_FILE, "r") as f:
                existing_schedule_data = json.load(f)

        # handle setting schedule when first time launching
        if self.current_schedule == {}:
            self.current_schedule = existing_schedule_data
            self.reset_schedule()

        if existing_schedule_data != new_schedule_data:
            logging.info("Schedule(s) have changed.")
            with open(SCHEDULE_FILE, "w") as f:
                json.dump(new_schedule_data, f)
            self.current_schedule = new_schedule_data
            self.reset_schedule()


schedule_manager = ScheduleManager()
schedule.every(5).seconds.do(schedule_manager.get_schedule).tag("get_schedule")

while True:
    logging.debug(schedule.get_jobs())
    schedule.run_pending()
    time.sleep(1)
