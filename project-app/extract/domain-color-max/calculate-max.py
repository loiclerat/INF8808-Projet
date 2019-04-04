import csv
import io
import json


file_name = "../Calcul-nombre-incident/result_Counties.json"

with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()

for year in data:
	max = 0
	min = 99999
	for state in data[year]:
		if data[year][state] > max:
			max = data[year][state]
		if data[year][state] < min:
			min = data[year][state]
			
	data[year]["maximum"] = max
	data[year]["minimum"] = min
	print(max)
	print(min)

		
with open('domain_Counties.json', 'w') as fp:
   json.dump(data, fp)

