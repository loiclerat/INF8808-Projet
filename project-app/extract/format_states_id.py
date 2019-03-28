import csv
import io
import json

file_name = "../data.json"

state_years_dict = dict()

county_years_dict = dict()


file_name = "us-states-formatted.csv"
extracted_results = []
columns = []

states = dict()

with open(file_name, 'r') as csvFile:
	next(csvFile)
	reader = csv.reader(csvFile)
	
	for row in reader:
		states[row[0]] = row[1]
		
		
csvFile.close()

with open('states-id.json', 'w') as fp:
	json.dump(states, fp)

#county_years_dict[date[:4]]['county']