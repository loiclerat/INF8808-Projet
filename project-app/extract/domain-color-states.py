import csv
import io
import json

file_name = "../data.json"

state_years_dict = dict()

county_years_dict = dict()


file_name = "result_Counties.json"
extracted_results = []
columns = []
isHeader = True

with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()





for year in data:
	max = 0
	for state in data[year]:
		if data[year][state] > max:
			max = data[year][state]
			
	data[year]["max"] = max
	print(max)

		
with open('domain_Counties.json', 'w') as fp:
   json.dump(data, fp)


#county_years_dict[date[:4]]['county']