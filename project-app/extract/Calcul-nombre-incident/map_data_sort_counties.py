import csv
import io
import json



county_years_dict = dict()

file_name = "../../data.json"

with open(file_name, 'r') as csvFile:
	data = json.load(csvFile)
csvFile.close()

county_years_dict["total"] = dict()

for val in data:
    date = val["date"]
    if date[:4] in county_years_dict:
        if val["city_or_county"] in county_years_dict[date[:4]]:
            county_years_dict[date[:4]][val["city_or_county"]] = county_years_dict[date[:4]][val["city_or_county"]] + 1
        else:
            county_years_dict[date[:4]][val["city_or_county"]] = 1
    else:
        county_years_dict[date[:4]] = dict()
        county_years_dict[date[:4]][val["city_or_county"]] = 1

    if val["city_or_county"] in county_years_dict["total"]:
        county_years_dict["total"][val["city_or_county"]] = county_years_dict["total"][val["city_or_county"]] + 1
    else:
        county_years_dict["total"][val["city_or_county"]] = 1

with open('result_Counties.json', 'w') as fp:
    json.dump(county_years_dict, fp)

#county_years_dict[date[:4]]['county']