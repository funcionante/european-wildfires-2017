import os
import glob
import sys

satelites = ['MODIS', 'VIIRS']

# get country:code dict
country_code = {}

with open('data/world_population.tsv', 'r') as my_file:
	content = my_file.readlines()

	# remove white space and \n
	content = [x.strip() for x in content]

	for row in content:
		values = row.split('\t')

		country_code[values[1]] = values[0]


for sat in satelites:
	# open file to write
	with open('data/'+sat+'/statistics.tsv', 'w') as the_file_elem:
		the_file_elem.write('id\tname\toccurrences\n')
	with open('data/'+sat+'/statistics_ti4.csv', 'w') as the_file_ti4:
		the_file_ti4.write('country,occurrences,bright_ti4_low,bright_ti4_avg,bright_ti4_high,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight\n')

	with open('data/'+sat+'/statistics_ti5.csv', 'w') as the_file_ti5:
		the_file_ti5.write('country,occurrences,bright_ti5_low,bright_ti5_avg,bright_ti5_high,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight\n')

	for country in next(os.walk('data/'+sat))[1]:
		# number of elements
		elements = 0

		# low & avg & high values for bright_ti4
		bright_ti4_low = float('inf')
		bright_ti4_avg = 0
		bright_ti4_high = float('-inf')

		# low & avg & high values for bright_ti5
		bright_ti5_low = float('inf')
		bright_ti5_avg = 0
		bright_ti5_high = float('-inf')

		# highest location
		bright_ti4_high_row = ''
		bright_ti5_high_row = ''

		for file in glob.glob('data/'+sat+'/'+country+'/*.csv'):
			with open(file, 'r') as my_file:
				content = my_file.readlines()

				# remove white space and \n
				content = [x.strip() for x in content] 

				# remove header
				del content[0]

				# process string 
				# latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
				for row in content:
					values = row.split(',')

					if values[8] != sat:
						print('wrong satellite, %s, country: %s'% (values[8], country))
						exit(101)

					elements += 1

					bright_ti4 = float(values[2])
					bright_ti5 = float(values[11])

					# average values
					bright_ti4_avg += bright_ti4
					bright_ti5_avg += bright_ti5

					# high & low values bright_ti4
					if bright_ti4 > bright_ti4_high:
						bright_ti4_high = bright_ti4

						# highest bright row
						bright_ti4_high_row = row

					elif bright_ti4 < bright_ti4_low:
						bright_ti4_low = bright_ti4

					# high & low values bright_ti5
					if bright_ti5 > bright_ti5_high:
						bright_ti5_high = bright_ti5

						# highest bright row
						bright_ti5_high_row = row

					elif bright_ti5 < bright_ti5_low:
						bright_ti5_low = bright_ti5

		bright_ti4_avg /= elements
		bright_ti5_avg /= elements

		with open('data/'+sat+'/statistics.tsv', 'a') as the_file_elem:
			country = country.replace('_',' ')
			the_file_elem.write("%s\t%s\t%d\n" % (country_code[country],country,elements))

		with open('data/'+sat+'/statistics_ti4.csv', 'a') as the_file_ti4:
			the_file_ti4.write("%s,%d,%.1f,%.2f,%.1f,%s\n" % (country, elements, bright_ti4_low, bright_ti4_avg, bright_ti4_high, bright_ti4_high_row))

		with open('data/'+sat+'/statistics_ti5.csv', 'a') as the_file_ti5:
			the_file_ti5.write("%s,%d,%.1f,%.2f,%.1f,%s\n" % (country, elements, bright_ti5_low, bright_ti5_avg, bright_ti5_high, bright_ti5_high_row))

		#exit()
		#for files in os.walk('data/'+sat+'/'+country):
		#	print(files)
