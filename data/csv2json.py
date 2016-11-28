import csv
import json
import time
import datetime
import re

from collections import defaultdict

relations = []
relations_dict = defaultdict(lambda: [])

with open('relations.csv', 'r') as csvfile:
    for idx,line in enumerate(csvfile):
        if idx==0 or line.split(',')[0]!='x':
        	continue

        line = line.split(',')
        print line
        date = line[5].split("/")
        print date
        new_date= datetime.datetime(2000+int(date[2]),int(date[0]),int(date[1]))
        info = re.sub('[^a-zA-Z\d\s]+','', line[6])

        relations_dict[(line[2],line[3])].append((line[4],new_date,info.rstrip(),line[7].rstrip()))

print relations_dict

for key,dates in relations_dict.iteritems():

	typ0 = dates[0][0]
	date0 = dates[0][1]
	info_source0 = dates[0][2]
	link0 = dates[0][3]
	for date in dates:
		if date[1]>date0:
			typ0 =date[0]
			date0 = date[1]
			info_source0 = date[2]
			link0 = date[3]

	relations.append({"from":key[0],"n":1,"to":key[1],"data":[{"type":typ0,"date":"","info":info_source0,"ref":link0}]})



with open('relations.js', 'w') as fp:
    fp.write('relations=\'')
    json.dump(relations, fp)
    fp.write('\'')

companies = []

with open('companies.csv', 'r') as csvfile:
   
    for idx,line in enumerate(csvfile):
        print line
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

