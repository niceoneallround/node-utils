
#
# nodebase - base image for running node applications

#
# How to build the image?
#   The following docker command run from the nodebase directory will build the image.
#   Note - there is no need to build as in the repo
#
#   "docker build -t niceoneallround/nodebase:latest ."


# use slim version has having issues with space on AWS
# https://hub.docker.com/_/node/
FROM node:5.6.0-slim

# make sure that apt is up to date
RUN apt-get update
RUN apt-get install -y apt-utils

# install git and its dependencies - REMOVE FOR NOW AS TRY TO SHRINK SPACE 24-Sept-15 rich
#RUN apt-get install -y git git-core

#install npm build-essential - REMOVE FOR NOW AS TRY TO SHRINK SPACE 24-Sept-15 rich
#To compile and install native addons from npm you may also need to install build tools:
#RUN apt-get install -y build-essential

#install nodemon - used in development
RUN npm install -g nodemon

#install forever used to run services in production as restarts on failure
RUN npm install -g forever
