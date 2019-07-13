from tqdm import tqdm
import requests
import os

dccon_id = input("input dccon id :")

header_for_getCookie = {'X-Requested-With':'XMLHttpRequest'}
header_for_imageServer = {'Referer': 'https://dccon.dcinside.com/'}
package_detail_url = 'https://dccon.dcinside.com/index/package_detail'
download_url = 'https://dcimg5.dcinside.com/dccon.php?no='
# Open session
s = requests.Session()
# Get Cookie (ci_c)
r = s.get(package_detail_url, headers=header_for_getCookie)
# Get Json (ci_c to ci_t)
req = s.post(package_detail_url, headers=header_for_getCookie, data={'ci_t':r.cookies['ci_c'], 'package_idx':dccon_id})

json_data = req.json()

default_dir = os.path.dirname(os.path.abspath(__file__))
download_path = os.path.join(default_dir, json_data['info']['title'])

try:
	os.makedirs(download_path)
except Exception as e:
	print(e)
else:
	for item in tqdm(json_data['detail']):
		filename = item['idx']+'.'+item['ext']
		image = s.get(download_url+item['path'], headers=header_for_imageServer)
		with open(os.path.join(download_path, filename), 'wb') as fd:
			for chunk in image.iter_content(chunk_size=128):
				fd.write(chunk)
			fd.close()
	# Session Close
	s.close()
	print('Job [', dccon_id, '] Complete!! ^^7')

raw_input("Press enter to continue..")
exit()