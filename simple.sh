#!/bin/bash

if [[ $@ -eq 0 ]] ; then
	echo "Provide a quoted commit string"
	exit 1
fi
 pushd ../jlettvin.github.io/EmerGenTium/
 cp ../../Three/simple.* .
 git commit -am "$1"
 git push
 cd ..
 git commit -am "$1"
 git push
 cd ../EmerGenTium/
 git pull
 popd
