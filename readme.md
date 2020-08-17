# Auto Deployment Script
```
This script watch a particular folder > file for any changes using scheduled cron job. If any changes is found
in the file, the script will automatically execute some batch script which will delete the existing contaianer/image
if any and then build the new image and deploy/run the container.
```