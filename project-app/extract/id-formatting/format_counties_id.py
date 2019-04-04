import csv
import io
import json

file_name = "../data.json"

state_years_dict = dict()

county_years_dict = dict()

file_name = "us-counties-formatted.csv"
extracted_results = []
columns = []

counties = dict()

with open(file_name, 'r') as csvFile:
	next(csvFile)
	reader = csv.reader(csvFile)
	
	for row in reader:
		if len(row[0]) == 4:
			id = "0" + row[0]
			counties[id] = row[1]
		else:
			counties[row[0]] = row[1]
		
csvFile.close()
print(counties)
with open('counties-id.json', 'w') as fp:
	json.dump(counties, fp)

#county_years_dict[date[:4]]['county']