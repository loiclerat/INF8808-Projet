import csv
import io
import json


state_years_dict = dict()

county_years_dict = dict()


file_name = "domain_States.json"
extracted_results = []
columns = []
isHeader = True

with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()





for year in data:
	for state in data[year]:
		data[year][state] = data[year][state] /  data[year]["max"]

		
with open('domain_States.json', 'w') as fp:
   json.dump(data, fp)


#county_years_dict[date[:4]]['county']