import csv
import io
import json

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
            if row[i] is None or str(row[i]) == "":
                can_add = False

        if can_add:
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
