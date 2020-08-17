cd deployment-files
docker build -f %2 -t %3 .

docker run -p %4:%4 --name %1 -d %3 
