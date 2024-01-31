import schedule


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
