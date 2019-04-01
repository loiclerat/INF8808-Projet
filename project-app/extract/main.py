import csv
import io
import json

import requests

file_name = "gun-violence-data_01-2013_03-2018.csv"
extracted_results = []
columns = []
isHeader = True
counter = 0

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

        counter += 1
        if can_add:
            lat = row[3]
            lon = row[4]
            row[2] = requests.get("https://geo.fcc.gov/api/census/area?lat={}&lon={}&format=json".format(lat, lon)).json()["results"][0]["county_name"]
            print("Request {} with {} and {}".format(counter, lat, lon))
            extracted_results.append(row)
csvFile.close()

final_data = []
for row in extracted_results:
    data = {}
    for i in range(0, len(columns)):
        data[columns[i]] = row[i]
    final_data.append(data)

# Write JSON file
with io.open('data.json', 'w', encoding='utf8') as outfile:
    outfile.write(
        json.dumps(final_data,
                   indent=4, sort_keys=True,
                   separators=(',', ': '), ensure_ascii=False)
    )
    outfile.close()
