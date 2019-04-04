import csv
import io
import json
import math


file_name = "domain_Counties.json"


with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()

for year in data:
	for county in data[year]:
		if county != "maximum" and county != "minimum":
			if data[year][county] > 0:
				data[year][county] = math.log(data[year][county], 10)  / math.log(data[year]["maximum"], 10)

	

		
with open('domain_Counties.json', 'w') as fp:
   json.dump(data, fp)


#county_years_dict[date[:4]]['county']