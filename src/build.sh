#!/bin/bash
# build.sh -- builds JAR and XPI files for mozilla extensions

# find ./ -name '.*' -not -name '.' -exec rm -rfd '{}' ';'
find ./ -name '.*' | grep -v '^\./$' | xargs rm -fr
zip -r target.xpi * -x \*.sh
