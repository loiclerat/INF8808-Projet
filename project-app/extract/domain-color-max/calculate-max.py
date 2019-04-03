import csv
import io
import json


file_name = "../Calcul-nombre-incident/result_States.json"


with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()





for year in data:
	max = 0
	for state in data[year]:
		if data[year][state] > max:
			max = data[year][state]
			
	data[year]["maximum"] = max
	print(max)

		
with open('domain_States.json', 'w') as fp:
   json.dump(data, fp)

