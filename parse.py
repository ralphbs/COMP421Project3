#liste =  ["vin              ", 
# "description      ", 
# "licenseplate     ", 
# "price            ", 
# "model            ", 
# "color            ", 
# "year             ", 
# "make             ", 
# "fuel             ", 
# "mileage          ", 
# "acceleration     ", 
# "enginetype       ", 
# "drivertype       ", 
# "branchid         ", 
# "businessid       ", 
# "manufacturedsince"] 

#liste = [" optionid  ", 
#" optiontype", 
#" price     "] 

#liste = ["employeeid  ", 
#"employeename", 
#"branch      ", 
#"salary      "] 

#liste = ["maintenanceid  ",  
#"maintenancetype", 
#"maintenancedate", 
#"vin            ", 
#"employeeid     "] 

liste = ["contractid      ", 
"dateofinitiation", 
"content         ", 
"price           ", 
"employeeid      ", 
"driverslicense  ", 
"vin             "] 

relation = "contracts"



for idx, x in enumerate(liste):
	liste[idx] = x.strip();

print liste

print "function handle%sStatistics(table_info, result) {" % (relation)
print "table_info['%s'] = {};" % (relation)
print

for idx, x in enumerate(liste):
	print "var %s = [];" % (liste[idx])
print

for idx,x in enumerate(liste):
	print "for (var row in result.rows) {"
	print "%s.push(result.rows[row]['%s']);" % (liste[idx], liste[idx])
	print "}"
	print "table_info['%s']['%s'] = %s;" % (relation, liste[idx],liste[idx])
	print

print "return table_info;"
print "}"
print
print "<table border=\"1\">"
print "<tr>"
for x in liste:
	print "<th>%s</th>" % (x)
print "</tr>"
print "<%"+" table_info.%s.%s.forEach(function(val,i) { "% (relation, liste[0])+"%>" 
print "<tr>"

for x in liste:
	print "<td><"+'%'+"= table_info['%s'].%s[i]" % (relation,x) +' %'+"></td>" 
print "</tr>"
print "<% }) %>"
print "</table>"
