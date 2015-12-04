#!/bin/sh

FILE="lds-scriptures.zip"

rm $FILE;
zip -r ../$FILE ./ -x "*.git*" "*data*" ".gitignore" "*.settings*" "package.sh" 
mv ../$FILE ./;

