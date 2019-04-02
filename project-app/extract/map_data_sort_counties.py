import csv
import io
import json

file_name = "../data.json"

state_years_dict = dict()

county_years_dict = dict()

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

for val in extracted_results:
	date = val[0]
	if date[:4] in county_years_dict:
		if val[2] in county_years_dict[date[:4]]:
			county_years_dict[date[:4]][val[2]] = county_years_dict[date[:4]][val[2]] + 1
		else:
			county_years_dict[date[:4]][val[2]] = 1
	else:
		county_years_dict[date[:4]] = dict()
		county_years_dict[date[:4]][val[2]] = 1
		
with open('result_Counties.json', 'w') as fp:
    json.dump(county_years_dict, fp)

#county_years_dict[date[:4]]['county']