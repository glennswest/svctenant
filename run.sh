docker kill svctenant.ncc9.com
docker rm svctenant.ncc9.com
docker run -d -P  --net=host -p 1883 -v /data/svctenant.ncc9.com:/data --name svctenant.ncc9.com svctenant
