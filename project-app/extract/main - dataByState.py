import csv
import io
import json
import numpy as np
from datetime import datetime


file_name = "gun-violence-data_01-2013_03-2018.csv"
extracted_results = []
columns = []
isHeader = True

with open(file_name, 'r') as csvFile:
    reader = csv.reader(csvFile)
    for row in reader:
        if isHeader is True:
            columns = row
            isHeader = False
            continue

        size = len(row)
        can_add = True
        for i in range(0, size):
            if row[i] is None or str(row[i]) == "" or "2018" in str(row[i]) or "2013" in str(row[i]):
                can_add = False

        if can_add:
            extracted_results.append(row)
csvFile.close()

data_by_state = []
for row in extracted_results:
    state_index = [i for i in range(len(data_by_state)) if data_by_state[i]["state"] == row[1]]
    if not state_index:
        state_index = len(data_by_state)
        incidents_by_month = np.zeros(48).tolist()  # 12 mois x 4 années
        data_by_state.append({"state": row[1], "incidents_by_month": incidents_by_month})
    else:
        state_index = state_index[0]

    date = datetime.strptime(row[0], '%Y-%m-%d')
    month = date.month
    year = date.year

    data_by_state[state_index]["incidents_by_month"][(year - 2014) * 12 + (month - 1)] += 1

# Write JSON file
with io.open('data-by-state.json', 'w', encoding='utf8') as outfile:
    outfile.write(
        json.dumps(data_by_state,
                   indent=4, sort_keys=True,
                   separators=(',', ': '), ensure_ascii=False)
    )
    outfile.close()
