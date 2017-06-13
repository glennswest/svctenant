docker build -t svctenant .
docker tag svctenant ctl.ncc9.com:5000/svctenant
docker push ctl.ncc9.com:5000/svctenant
