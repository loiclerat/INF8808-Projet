import csv
import io
import json


file_name = "domain_States.json"


with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()

for year in data:
	max = 0
	for county in data[year]:
		data[year][county] = data[year][county]  / data[year]["maximum"]
	

		
with open('domain_States.json', 'w') as fp:
   json.dump(data, fp)


#county_years_dict[date[:4]]['county']