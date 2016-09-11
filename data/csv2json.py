import csv
import json
import time
import datetime

from collections import defaultdict

relations = []
relations_dict = defaultdict(lambda: [])

with open('AD_landscape_data.csv', 'r') as csvfile:
   
    for idx,line in enumerate(csvfile):
        #print line
        if idx==0:
        	continue

        line = line.split(',')
        print line

        #date = time.mktime(datetime.datetime.strptime(line[4], "%m/%d/%Y").timetuple())

        #date = datetime.datetime.strptime(line[4], "%m%d%Y")
        date = line[4].split("/")

        new_date= datetime.datetime(2000+int(date[2]),int(date[0]),int(date[1]))
        #print new_date

        relations_dict[(line[1],line[2])].append((line[3],new_date,line[5].rstrip()))
        #print line
        #relations.append({"from":line[1],"n":1,"to":line[2],"data":[{"type":line[3],"date":line[4],"source":""}]})

print relations_dict

for key,dates in relations_dict.iteritems():

	typ0 = dates[0][0]
	date0 = dates[0][1]
	info_source0 = dates[0][2]
	for date in dates:
		if date[1]>date0:
			typ0 =date[0]
			date0 = date[1]
			info_source0 = date[2]

	relations.append({"from":key[0],"n":1,"to":key[1],"data":[{"type":typ0,"date":"","info":info_source0}]})



with open('relations.js', 'w') as fp:
    fp.write('relations=\'')
    json.dump(relations, fp)
    fp.write('\'')

companies = []

with open('companies.csv', 'r') as csvfile:
   
    for idx,line in enumerate(csvfile):
        
        line = line.split(',')
        if idx==0 or not line[2] or line[2]=="" or line[2]!="mvp":
            continue
        #print line
       	print line[1]

        #print line
        companies.append({"company":line[1],"company_type":line[3],\
        	"technology_type":line[4],"size":line[5],"img":""})

with open('companies.js', 'w') as fp:
    fp.write('companies=\'')
    json.dump(companies, fp)
    fp.write('\'')

