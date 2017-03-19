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

liste = ["employeeid  ", 
"employeename", 
"branch      ", 
"salary      "] 


relation = "mechanics"


for idx, x in enumerate(liste):
	liste[idx] = x.strip();

print liste

for idx,x in enumerate(liste):
	print "for (var row in result.rows) {"
	print "%s.push(result.rows[row]['%s']);" % (liste[idx], liste[idx])
	print "}"
	print "table_info['%s']['%s'] = %s;" % (relation, liste[idx],liste[idx])
	print

for x in liste:
	print "<td><"+'%'+"= table_info['%s'].%s[i]" % (relation,x) +' %'+"></td>" 
